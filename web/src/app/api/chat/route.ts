import { auth } from "@/lib/auth";
import { sqlClient } from "@/lib/prismadb";
import type { ChatMessage } from "@/types/virtual-experience";
import type { ChatHistoryEntry } from "./gemini";
import { getGeminiReply } from "./gemini";
import { runRhubarb } from "./lipsync";
import { textToSpeech } from "./tts";

const GEMINI_API_KEY =
	process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

const OWNER_EMAIL = "mingster.tsai@gmail.com";

async function isAuthorized(userId: string, email: string): Promise<boolean> {
	if (email === OWNER_EMAIL) return true;
	const sub = await sqlClient.subscription.findFirst({
		where: { referenceId: userId, status: { in: ["active", "trialing"] } },
		select: { id: true },
	});
	return sub !== null;
}

/**
 * POST /api/chat
 * Body: { message?: string, history?: ChatHistoryEntry[] }
 * Returns: NDJSON stream — one JSON object per line, each a ChatMessage.
 *
 * Auth: requires a valid session. Only owner email or active subscribers may chat.
 * Intro (no message body) is public — allows the avatar to greet unauthenticated visitors.
 */
export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const message = typeof body.message === "string" ? body.message.trim() : "";
	const history: ChatHistoryEntry[] = Array.isArray(body.history)
		? body.history
		: [];
	const noAudio = body.noAudio === true;

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const send = (msg: ChatMessage) =>
				controller.enqueue(encoder.encode(`${JSON.stringify(msg)}\n`));

			try {
				// Intro messages are public — no auth needed
				if (!message) {
					send({
						text: "Hi! I'm your virtual companion. Say something and I'll reply with voice and expressions.",
						facialExpression: "happy",
						animation: "Talking_0",
					});
					send({
						text: "You can ask me anything, and I'll do my best to keep you company.",
						facialExpression: "neutral",
						animation: "Idle",
					});
					controller.close();
					return;
				}

				// Auth check for actual chat
				const session = await auth.api.getSession({ headers: req.headers });
				if (!session?.user) {
					controller.close();
					return;
				}
				if (!(await isAuthorized(session.user.id, session.user.email ?? ""))) {
					controller.close();
					return;
				}

				if (!GEMINI_API_KEY) {
					send({
						text: "Chat is not configured yet. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
						facialExpression: "sad",
						animation: "Idle",
					});
					controller.close();
					return;
				}

				const parts = await getGeminiReply(message, GEMINI_API_KEY, history);
				const disableLipSync = process.env.DISABLE_LIP_SYNC === "true";

				for (const p of parts) {
					let audio: string | undefined;
					let audioMime: "audio/wav" | "audio/mpeg" | undefined;
					let lipsync: ChatMessage["lipsync"];
					if (!noAudio) {
						try {
							const ttsResult = await textToSpeech(p.text);
							audio = ttsResult.audioBase64;
							audioMime = ttsResult.isWav ? "audio/wav" : "audio/mpeg";
							if (!disableLipSync && ttsResult.isWav && ttsResult.audioBase64) {
								const wavBuffer = Buffer.from(ttsResult.audioBase64, "base64");
								lipsync = (await runRhubarb(wavBuffer)) ?? undefined;
							}
						} catch (ttsErr) {
							console.warn("TTS failed for message:", ttsErr);
						}
					}
					send({
						text: p.text,
						facialExpression: p.facialExpression,
						animation: p.animation,
						audio,
						audioMime,
						lipsync,
					});
				}
				controller.close();
			} catch (err) {
				console.error("POST /api/chat error:", err);
				send({
					text:
						err instanceof Error
							? err.message
							: "Something went wrong. Please try again.",
					facialExpression: "sad",
					animation: "Idle",
				});
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "application/x-ndjson" },
	});
}
