import {
	AiGenerationError,
	generateAssignedText,
} from "@/lib/ai/generate-assigned-text.server";
import type { AttemptUsage } from "@/lib/ai/generate-content";
import {
	type AvatarReply,
	parseAvatarReply,
} from "@/lib/ai/parse-avatar-reply";
import logger from "@/lib/logger";
import type { ChatMessage } from "@/types/virtual-experience";
import { buildChatPrompt, buildChatSystem } from "./chat-prompt";
import { type FixedReplyKey, getFixedReply } from "./fixed-replies";
import { getChatAccess } from "./get-chat-access";
import {
	type ChatLocale,
	DEFAULT_CHAT_LOCALE,
	detectReplyLocale,
} from "./language";
import { chatRequestSchema } from "./request-schema";
import { speakPart } from "./speak";

/** Starting values, tune from the per attempt logs. */
const MODEL_TIMEOUT_MS = 20_000;
const MODEL_MAX_OUTPUT_TOKENS = 4096;
const BAD_OUTPUT_LOG_CHARS = 300;

type Send = (msg: ChatMessage) => void;

interface TurnContext {
	userId?: string;
	message: string;
	history: NonNullable<ReturnType<typeof chatRequestSchema.parse>["history"]>;
	uiLanguage: ChatLocale;
	noAudio: boolean;
}

function errorName(err: unknown): string {
	return err instanceof Error ? err.name : "unknown";
}

async function sendFixed(
	send: Send,
	key: FixedReplyKey,
	locale: ChatLocale,
	noAudio: boolean,
) {
	const { message } = await getFixedReply(key, locale, { noAudio });
	send(message);
}

/** One line per model attempt (case 21). Counts and timings only, never chat text. */
function logAttempts(
	attempts: AttemptUsage[],
	ctx: Pick<TurnContext, "userId">,
	turn: {
		ttsMs: number;
		rhubarbMs: number;
		reply?: Pick<AvatarReply, "grounding" | "offTopic">;
	},
) {
	for (const a of attempts) {
		logger.info("avatar chat model attempt", {
			userId: ctx.userId,
			metadata: {
				modelId: a.modelId,
				provider: a.provider,
				usedFallback: a.usedFallback,
				attempt: a.attempt,
				inputTokens: a.inputTokens,
				cachedInputTokens: a.cachedInputTokens,
				outputTokens: a.outputTokens,
				thinkingTokens: a.thinkingTokens,
				modelMs: a.modelMs,
				ttsMs: turn.ttsMs,
				rhubarbMs: turn.rhubarbMs,
				grounding: turn.reply?.grounding ?? null,
				offTopic: turn.reply?.offTopic ?? null,
				finishReason: a.finishReason,
				errorName: a.errorName,
				errorStatus: a.errorStatus,
			},
			tags: ["avatar-chat", "model-attempt"],
		});
	}
}

async function runModelTurn(send: Send, ctx: TurnContext) {
	const replyLocale = detectReplyLocale(ctx.message, ctx.uiLanguage);
	let result: Awaited<ReturnType<typeof generateAssignedText>>;
	try {
		result = await generateAssignedText({
			purpose: "avatar_chat",
			system: buildChatSystem(replyLocale),
			prompt: buildChatPrompt(ctx.history, ctx.message),
			timeoutMs: MODEL_TIMEOUT_MS,
			maxOutputTokens: MODEL_MAX_OUTPUT_TOKENS,
		});
	} catch (err) {
		const failure = err instanceof AiGenerationError ? err : null;
		logAttempts(failure?.attempts ?? [], ctx, { ttsMs: 0, rhubarbMs: 0 });
		logger.warn("avatar chat model call failed", {
			userId: ctx.userId,
			metadata: {
				notConfigured: failure?.notConfigured ?? false,
				causeName: errorName(failure?.cause ?? err),
				// Safe: configuration errors carry fixed text only.
				cause: failure?.notConfigured
					? (failure.cause as Error).message
					: undefined,
			},
			tags: ["avatar-chat", "model-failed"],
		});
		await sendFixed(
			send,
			failure?.notConfigured
				? "avatar_chat_reply_not_configured"
				: "avatar_chat_reply_failed",
			ctx.uiLanguage,
			ctx.noAudio,
		);
		return;
	}

	let reply: AvatarReply;
	try {
		reply = parseAvatarReply(result.text);
	} catch {
		const last = result.attempts[result.attempts.length - 1];
		logAttempts(result.attempts, ctx, { ttsMs: 0, rhubarbMs: 0 });
		logger.warn("avatar chat bad model output", {
			userId: ctx.userId,
			metadata: {
				length: result.text.length,
				finishReason: last?.finishReason,
				head: result.text.slice(0, BAD_OUTPUT_LOG_CHARS),
			},
			tags: ["avatar-chat", "bad-json"],
		});
		await sendFixed(
			send,
			"avatar_chat_reply_failed",
			ctx.uiLanguage,
			ctx.noAudio,
		);
		return;
	}

	let ttsMs = 0;
	let rhubarbMs = 0;
	try {
		for (const part of reply.parts) {
			const spoken = await speakPart(part, replyLocale, {
				noAudio: ctx.noAudio,
			});
			ttsMs += spoken.ttsMs;
			rhubarbMs += spoken.rhubarbMs;
			send(spoken.message);
		}
	} finally {
		logAttempts(result.attempts, ctx, { ttsMs, rhubarbMs, reply });
	}
}

function streamOf(work: (send: Send) => Promise<void>): Response {
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const send: Send = (msg) => {
				try {
					controller.enqueue(encoder.encode(`${JSON.stringify(msg)}\n`));
				} catch {
					// The client went away; nothing left to send to.
				}
			};
			try {
				await work(send);
			} catch (err) {
				logger.error("avatar chat stream failed", {
					metadata: { errorName: errorName(err) },
					tags: ["avatar-chat"],
				});
			} finally {
				try {
					controller.close();
				} catch {
					/* already closed */
				}
			}
		},
	});
	return new Response(stream, {
		headers: { "Content-Type": "application/x-ndjson" },
	});
}

/**
 * POST /api/chat
 * Body: { message?, history?, noAudio?, uiLanguage? } (see chatRequestSchema).
 * Returns: NDJSON stream, one JSON object per line, each a ChatMessage.
 *
 * A body that fails the schema gets 400 with no model call and no TTS. An empty
 * message returns the public intro. Otherwise the access gate runs: signed out
 * and unpaid users hear a cached spoken reply, the owner and paid users get a model reply.
 */
export async function POST(req: Request) {
	const parsed = chatRequestSchema.safeParse(
		await req.json().catch(() => ({})),
	);
	if (!parsed.success) {
		logger.warn("avatar chat bad request", {
			metadata: {
				fields: parsed.error.issues.map((issue) => issue.path.join(".")),
			},
			tags: ["avatar-chat"],
		});
		return Response.json({ error: "invalid_request" }, { status: 400 });
	}
	const uiLanguage = parsed.data.uiLanguage ?? DEFAULT_CHAT_LOCALE;
	const noAudio = parsed.data.noAudio === true;
	const message = parsed.data.message?.trim() ?? "";

	if (!message) {
		return streamOf(async (send) => {
			await sendFixed(send, "avatar_chat_intro_1", uiLanguage, noAudio);
			await sendFixed(send, "avatar_chat_intro_2", uiLanguage, noAudio);
		});
	}

	let access: Awaited<ReturnType<typeof getChatAccess>>;
	try {
		access = await getChatAccess();
	} catch (err) {
		logger.error("avatar chat access check failed", {
			metadata: { errorName: errorName(err) },
			tags: ["avatar-chat"],
		});
		return streamOf((send) =>
			sendFixed(send, "avatar_chat_reply_failed", uiLanguage, noAudio),
		);
	}
	logger.info("avatar chat request", {
		userId: access.userId,
		metadata: { access: access.access },
		tags: ["avatar-chat", "request"],
	});

	if (access.access === "sign_in") {
		return streamOf((send) =>
			sendFixed(send, "avatar_chat_reply_sign_in", uiLanguage, noAudio),
		);
	}
	if (access.access === "paid_only") {
		return streamOf((send) =>
			sendFixed(send, "avatar_chat_reply_paid_only", uiLanguage, noAudio),
		);
	}

	return streamOf((send) =>
		runModelTurn(send, {
			userId: access.userId,
			message,
			history: parsed.data.history ?? [],
			uiLanguage,
			noAudio,
		}),
	);
}
