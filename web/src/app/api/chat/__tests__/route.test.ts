import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	mock,
	setDefaultTimeout,
	test,
} from "bun:test";
import {
	chmodSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Each turn spawns shell shims, which is slow on a loaded machine.
setDefaultTimeout(20_000);

// Only third party code and the session are faked. The route, the access rule,
// the AI module, the fixed reply cache, TTS and the spawn helper run for real.
// ffmpeg and Rhubarb are small shell scripts on PATH that count their runs.

let session: unknown = null;
let subscriptionStatus: string | null = null;
const logs: { level: string; message: string; opts: any }[] = [];
const ttsCalls: { text: string; voice: string }[] = [];
const geminiCalls: { model: string; prompt: string }[] = [];
let ttsFails = false;
let geminiBehavior: () => unknown = () => {
	throw new Error("no behavior set");
};

mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: async () => session } },
}));
mock.module("next/headers", () => ({
	headers: async () => new Headers(),
	cookies: async () => ({ get: () => undefined }),
}));
mock.module("@/lib/prismadb", () => ({
	sqlClient: {
		subscription: {
			findFirst: async () =>
				subscriptionStatus === "active" || subscriptionStatus === "trialing"
					? { id: "sub" }
					: null,
		},
		platformSettings: { findFirst: async () => null },
	},
}));
mock.module("@/lib/logger", () => {
	const log = (level: string) => (message: string, opts: any) => {
		logs.push({ level, message, opts });
	};
	return {
		default: {
			info: log("info"),
			warn: log("warn"),
			error: log("error"),
			debug: log("debug"),
		},
	};
});
mock.module("edge-tts-universal", () => ({
	Communicate: class {
		constructor(
			private text: string,
			opts: { voice: string },
		) {
			ttsCalls.push({ text, voice: opts.voice });
		}
		async *stream() {
			if (ttsFails) throw new Error("tts down");
			yield { type: "audio", data: new Uint8Array([1, 2, 3, 4]) };
		}
	},
}));
mock.module("@google/generative-ai", () => ({
	GoogleGenerativeAI: class {
		getGenerativeModel(params: { model: string }) {
			return {
				generateContent: async (prompt: string) => {
					geminiCalls.push({ model: params.model, prompt });
					return geminiBehavior();
				},
			};
		}
	},
}));

const shimDir = mkdtempSync(join(tmpdir(), "chat-shims-"));
const spawnLog = join(shimDir, "spawns.log");
const savedEnv = { ...process.env };

let POST: (req: Request) => Promise<Response>;
let clearFixedReplyCache: () => void;

beforeAll(async () => {
	writeFileSync(spawnLog, "");
	const ffmpeg = `#!/bin/sh
echo ffmpeg >> "${spawnLog}"
for a in "$@"; do if [ "$prev" = "-i" ]; then in="$a"; fi; prev="$a"; out="$a"; done
cp "$in" "$out"
`;
	const rhubarb = `#!/bin/sh
echo rhubarb >> "${spawnLog}"
for a in "$@"; do if [ "$prev" = "-o" ]; then out="$a"; fi; prev="$a"; done
echo '{"mouthCues":[{"start":0,"end":0.1,"value":"A"}]}' > "$out"
`;
	writeFileSync(join(shimDir, "ffmpeg"), ffmpeg);
	writeFileSync(join(shimDir, "rhubarb"), rhubarb);
	chmodSync(join(shimDir, "ffmpeg"), 0o755);
	chmodSync(join(shimDir, "rhubarb"), 0o755);
	process.env.PATH = `${shimDir}:${process.env.PATH}`;
	process.env.RHUBARB_PATH = join(shimDir, "rhubarb");
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	process.env.ADMINS = "owner@example.com";
	delete process.env.DISABLE_LIP_SYNC;
	({ POST } = await import("../route"));
	({ clearFixedReplyCache } = await import("../fixed-replies"));
});

afterAll(() => {
	process.env = { ...savedEnv };
	rmSync(shimDir, { recursive: true, force: true });
});

beforeEach(() => {
	session = null;
	subscriptionStatus = null;
	logs.length = 0;
	ttsCalls.length = 0;
	geminiCalls.length = 0;
	writeFileSync(spawnLog, "");
	clearFixedReplyCache();
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
});
afterEach(() => {
	geminiBehavior = () => {
		throw new Error("no behavior set");
	};
});

const spawns = () => readFileSync(spawnLog, "utf8").split("\n").filter(Boolean);

function post(body: unknown) {
	return POST(
		new Request("http://localhost/api/chat", {
			method: "POST",
			body: typeof body === "string" ? body : JSON.stringify(body),
		}),
	);
}

async function lines(res: Response) {
	const text = await res.text();
	return text
		.split("\n")
		.filter(Boolean)
		.map((l) => JSON.parse(l));
}

function modelReply(parts: unknown[], extra: Record<string, unknown> = {}) {
	return {
		response: {
			text: () =>
				JSON.stringify({
					parts,
					grounding: "grounded",
					off_topic: false,
					...extra,
				}),
			usageMetadata: {
				promptTokenCount: 120,
				cachedContentTokenCount: 20,
				candidatesTokenCount: 30,
				thoughtsTokenCount: 7,
			},
			candidates: [{ finishReason: "STOP" }],
		},
	};
}

const asOwner = () => {
	session = {
		user: { id: "owner-id", email: "owner@example.com", emailVerified: true },
	};
};
const part = (text: string) => ({
	text,
	facialExpression: "happy",
	animation: "Excited",
});

describe("case 1: signed out", () => {
	test("streams the cached sign in reply, no model call; the second POST spawns nothing", async () => {
		const first = await lines(
			await post({ message: "hello", uiLanguage: "en" }),
		);
		expect(first).toHaveLength(1);
		expect(first[0].text).toBe("Please sign in first to chat with me.");
		expect(first[0].audio).toBeTruthy();
		expect(first[0].lipsync.mouthCues.length).toBeGreaterThan(0);
		expect(geminiCalls).toHaveLength(0);
		const ttsAfterFirst = ttsCalls.length;
		const spawnsAfterFirst = spawns().length;
		expect(ttsAfterFirst).toBe(1);
		expect(spawnsAfterFirst).toBe(2);

		logs.length = 0;
		const second = await lines(
			await post({ message: "hello again", uiLanguage: "en" }),
		);
		expect(second[0]).toEqual(first[0]);
		expect(ttsCalls).toHaveLength(ttsAfterFirst);
		expect(spawns()).toHaveLength(spawnsAfterFirst);
		expect(geminiCalls).toHaveLength(0);
		expect(logs.some((l) => l.message.includes("cache hit"))).toBe(true);
	});

	test("a degraded build (TTS down) is sent as text and is not cached", async () => {
		ttsFails = true;
		const degraded = await lines(
			await post({ message: "hi", uiLanguage: "en" }),
		);
		expect(degraded[0].text).toBe("Please sign in first to chat with me.");
		expect(degraded[0].audio).toBeUndefined();
		ttsFails = false;
		const recovered = await lines(
			await post({ message: "hi", uiLanguage: "en" }),
		);
		expect(recovered[0].audio).toBeTruthy();
	});

	test("the cache is per language", async () => {
		await lines(await post({ message: "hi", uiLanguage: "en" }));
		const jp = await lines(await post({ message: "hi", uiLanguage: "jp" }));
		expect(jp[0].text).toBe("チャットするには、先にログインしてください。");
		expect(ttsCalls.map((c) => c.voice)).toContain("ja-JP-NanamiNeural");
	});
});

describe("case 2: signed in, unpaid", () => {
	test("streams the cached paid only reply with no model call", async () => {
		session = { user: { id: "u2", email: "u2@example.com" } };
		const out = await lines(await post({ message: "hi", uiLanguage: "en" }));
		expect(out).toHaveLength(1);
		expect(out[0].text).toBe(
			"Chat is only open to invited paid subscribers right now.",
		);
		expect(geminiCalls).toHaveLength(0);
	});
});

describe("case 4 and 7: owner, no subscription, no PlatformSettings row", () => {
	test("the owner chats on gemini-flash-latest with audio and lip sync", async () => {
		asOwner();
		geminiBehavior = () => modelReply([part("Hello there")]);
		const out = await lines(
			await post({ message: "hi", uiLanguage: "en", history: [] }),
		);
		expect(out).toHaveLength(1);
		expect(out[0]).toMatchObject({
			text: "Hello there",
			facialExpression: "happy",
			animation: "Excited",
			audioMime: "audio/wav",
		});
		expect(out[0].lipsync.mouthCues).toHaveLength(1);
		expect(geminiCalls[0].model).toBe("gemini-flash-latest");
		const attempt = logs.find((l) => l.message === "avatar chat model attempt");
		expect(attempt?.opts.metadata.modelId).toBe("gemini-flash-latest");
	});
});

describe("case 21 and 29: logs", () => {
	test("one request line with access and userId, one attempt line with the full field set", async () => {
		asOwner();
		geminiBehavior = () =>
			modelReply([part("Secret reply text")], { grounding: "unanswered" });
		await lines(
			await post({
				message: "private question with alice@example.com",
				uiLanguage: "en",
				history: [{ role: "user", text: "earlier secret" }],
			}),
		);
		const requestLines = logs.filter(
			(l) => l.message === "avatar chat request",
		);
		expect(requestLines).toHaveLength(1);
		expect(requestLines[0].opts.metadata.access).toBe("ok");
		expect(requestLines[0].opts.userId).toBe("owner-id");

		const attempts = logs.filter(
			(l) => l.message === "avatar chat model attempt",
		);
		expect(attempts).toHaveLength(1);
		const m = attempts[0].opts.metadata;
		expect(m).toMatchObject({
			modelId: "gemini-flash-latest",
			provider: "gemini",
			usedFallback: false,
			attempt: 1,
			inputTokens: 120,
			cachedInputTokens: 20,
			outputTokens: 30,
			thinkingTokens: 7,
			grounding: "unanswered",
			offTopic: false,
		});
		expect(typeof m.modelMs).toBe("number");
		expect(m.ttsMs).toBeGreaterThanOrEqual(0);
		expect(m.rhubarbMs).toBeGreaterThanOrEqual(0);
		expect(attempts[0].opts.userId).toBe("owner-id");

		const all = JSON.stringify(logs);
		for (const forbidden of [
			"private question",
			"alice@example.com",
			"earlier secret",
			"Secret reply text",
			"owner@example.com",
		]) {
			expect(all).not.toContain(forbidden);
		}
	});

	test("signed out and unpaid requests log their access value", async () => {
		await lines(await post({ message: "hi", uiLanguage: "en" }));
		session = { user: { id: "u3", email: "u3@example.com" } };
		await lines(await post({ message: "hi", uiLanguage: "en" }));
		const accessValues = logs
			.filter((l) => l.message === "avatar chat request")
			.map((l) => [l.opts.metadata.access, l.opts.userId]);
		expect(accessValues).toEqual([
			["sign_in", undefined],
			["paid_only", "u3"],
		]);
	});
});

describe("case 6: failure", () => {
	test("a 5xx speaks the failed reply and leaks no error text", async () => {
		asOwner();
		geminiBehavior = () => {
			throw Object.assign(new Error("https://secret.upstream/v1 exploded"), {
				status: 503,
			});
		};
		const out = await lines(await post({ message: "hi", uiLanguage: "en" }));
		expect(out).toHaveLength(1);
		expect(out[0].text).toBe(
			"Sorry, I couldn't answer that. Please try again.",
		);
		expect(JSON.stringify(out)).not.toContain("secret.upstream");
		expect(JSON.stringify(logs)).not.toContain("secret.upstream");
		const attempt = logs.find((l) => l.message === "avatar chat model attempt");
		expect(attempt?.opts.metadata.errorStatus).toBe(503);
	});

	test("bad JSON speaks the failed reply and logs metadata only, never content", async () => {
		asOwner();
		const echoed = `{"parts":[{"text":"echo marker-4471 mail alice@example.com ${"x".repeat(2000)}`;
		geminiBehavior = () => ({
			response: {
				text: () => echoed,
				usageMetadata: {},
				candidates: [{ finishReason: "MAX_TOKENS" }],
			},
		});
		const out = await lines(
			await post({
				message: "my note marker-4471 and alice@example.com",
				uiLanguage: "en",
			}),
		);
		expect(out).toHaveLength(1);
		expect(out[0].text).toBe(
			"Sorry, I couldn't answer that. Please try again.",
		);
		const bad = logs.filter(
			(l) => l.message === "avatar chat bad model output",
		);
		expect(bad).toHaveLength(1);
		expect(bad[0].opts.metadata).toEqual({
			errorName: "AvatarReplyParseError",
			length: echoed.length,
			finishReason: "MAX_TOKENS",
			provider: "gemini",
			modelId: "gemini-flash-latest",
		});
		const all = JSON.stringify(logs);
		expect(all).not.toContain("marker-4471");
		expect(all).not.toContain("@example.com");
		expect(all).not.toContain("echo ");
	});

	test("a reply with 30 parts speaks only the first 6", async () => {
		asOwner();
		geminiBehavior = () =>
			modelReply(Array.from({ length: 30 }, (_, i) => part(`part ${i}`)));
		const out = await lines(await post({ message: "hi", uiLanguage: "en" }));
		expect(out.map((m) => m.text)).toEqual(
			Array.from({ length: 6 }, (_, i) => `part ${i}`),
		);
		expect(ttsCalls).toHaveLength(6);
	});
});

describe("case 22: Gemini key missing", () => {
	test("speaks not_configured and keeps the cause in the log only", async () => {
		asOwner();
		delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		delete process.env.GEMINI_API_KEY;
		const out = await lines(await post({ message: "hi", uiLanguage: "en" }));
		expect(out[0].text).toBe(
			"I can't answer right now. Please try again later.",
		);
		expect(geminiCalls).toHaveLength(0);
		expect(JSON.stringify(out)).not.toMatch(/API|key|GOOGLE|GEMINI/i);
		const failed = logs.find(
			(l) => l.message === "avatar chat model call failed",
		);
		expect(failed?.opts.metadata.notConfigured).toBe(true);
		expect(failed?.opts.metadata.cause).toContain("No API key");
	});
});

describe("case 15: language and voice", () => {
	test("Japanese, Chinese and English messages pick the matching reply language and voice", async () => {
		asOwner();
		geminiBehavior = () => modelReply([part("reply")]);
		await lines(await post({ message: "こんにちは", uiLanguage: "en" }));
		await lines(await post({ message: "你好嗎", uiLanguage: "en" }));
		await lines(await post({ message: "How are you", uiLanguage: "en" }));
		expect(ttsCalls.map((c) => c.voice)).toEqual([
			"ja-JP-NanamiNeural",
			"zh-TW-HsiaoChenNeural",
			process.env.EDGE_TTS_VOICE ?? "en-US-JennyNeural",
		]);
		expect(geminiCalls[0].prompt).not.toContain("Traditional");
	});
});

describe("case 23: request bounds over HTTP", () => {
	test("a bad body gets 400 with no model call and no TTS, even signed out", async () => {
		const bodies = [
			{ message: "x".repeat(2001) },
			{
				history: Array.from({ length: 13 }, () => ({
					role: "user",
					text: "a",
				})),
			},
			{ history: [{ role: "system", text: "a" }] },
			{ uiLanguage: "fr" },
			"null",
			"not json at all",
			"",
		];
		for (const body of bodies) {
			const res = await post(body);
			expect(res.status).toBe(400);
		}
		expect(geminiCalls).toHaveLength(0);
		expect(ttsCalls).toHaveLength(0);
	});
});

describe("intro", () => {
	test("an empty body streams the two intro lines in the UI language, no auth needed", async () => {
		const out = await lines(await post({ uiLanguage: "en" }));
		expect(out.map((m) => m.text)).toEqual([
			"Hi, I'm virtual Ming, an AI assistant. Say something and I'll answer with voice and expressions.",
			"Ask me about any post on the blog.",
		]);
	});

	test("noAudio sends text only and spawns nothing", async () => {
		const out = await lines(await post({ uiLanguage: "tw", noAudio: true }));
		expect(out).toHaveLength(2);
		expect(out[0].audio).toBeUndefined();
		expect(ttsCalls).toHaveLength(0);
		expect(spawns()).toHaveLength(0);
	});
});

describe("cases 11 to 13: blog knowledge reaches the model", () => {
	test("the prompt holds the public corpus, corpus first, earlier turns next, message last", async () => {
		asOwner();
		geminiBehavior = () => modelReply([part("ok")]);
		await lines(
			await post({
				message: "W124 的變速箱油壓是多少？",
				uiLanguage: "en",
				history: [{ role: "user", text: "earlier-turn-marker" }],
			}),
		);
		const prompt = geminiCalls[0].prompt;
		expect(prompt).toContain("Benz W124 E280");
		expect(prompt).toContain("變速箱油壓");
		expect(prompt).toContain("Elon Mush's 'the algorithm'");
		expect(prompt).not.toContain("export const meta");
		expect(prompt.indexOf("Titles:")).toBeLessThan(
			prompt.indexOf("earlier-turn-marker"),
		);
		expect(prompt.trimEnd().endsWith('"W124 的變速箱油壓是多少？"')).toBe(true);
	});

	test("the corpus text is never logged", async () => {
		asOwner();
		geminiBehavior = () => modelReply([part("ok")]);
		await lines(await post({ message: "hi", uiLanguage: "en" }));
		expect(JSON.stringify(logs)).not.toContain("變速箱油壓");
	});
});
