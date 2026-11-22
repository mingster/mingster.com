import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const warns: { message: string; opts: unknown }[] = [];
mock.module("@/lib/logger", () => ({
	default: {
		info: () => {},
		warn: (message: string, opts: unknown) => warns.push({ message, opts }),
		error: () => {},
		debug: () => {},
	},
}));
mock.module("@/lib/prismadb", () => ({ sqlClient: {} }));

const { generateGrokText, GrokApiError } = await import(
	"../generate-grok-text"
);
const { generateContent } = await import("../generate-content");
const { generateAssignedText } = await import(
	"../generate-assigned-text.server"
);
const { classifyProviderError } = await import("../classify-provider-error");
const { parseAiModelAssignment, getModelCatalogEntry } = await import(
	"../model-catalog"
);
const { hasUsableProviderKey } = await import("../provider-env-keys");

const grok = getModelCatalogEntry("grok-4.3");
if (!grok) throw new Error("catalog");

const KEY = "xai-fake-secret-key";

const okBody = {
	status: "completed",
	output: [
		{ type: "reasoning", content: [{ type: "reasoning_text", text: "no" }] },
		{
			type: "message",
			content: [
				{ type: "output_text", text: '{"parts":' },
				{ type: "output_text", text: "[]}" },
			],
		},
	],
	usage: {
		input_tokens: 32,
		input_tokens_details: { cached_tokens: 12 },
		output_tokens: 9,
		output_tokens_details: { reasoning_tokens: 110 },
		total_tokens: 151,
	},
};

interface Seen {
	url: string;
	init: RequestInit;
}

function fakeFetch(respond: () => Response, seen: Seen[] = []): typeof fetch {
	return (async (url: unknown, init?: RequestInit) => {
		seen.push({ url: String(url), init: init ?? {} });
		return respond();
	}) as typeof fetch;
}

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

const saved = { ...process.env };
beforeEach(() => {
	warns.length = 0;
});
afterEach(() => {
	process.env = { ...saved };
});

describe("generateGrokText", () => {
	test("posts to the xAI responses endpoint and maps text and usage", async () => {
		const seen: Seen[] = [];
		const r = await generateGrokText(
			{ entry: grok, prompt: "hello", system: "policy", maxOutputTokens: 700 },
			KEY,
			undefined,
			fakeFetch(() => json(okBody), seen),
		);
		expect(seen).toHaveLength(1);
		expect(seen[0].url).toBe("https://api.x.ai/v1/responses");
		expect(seen[0].init.method).toBe("POST");
		expect(JSON.parse(String(seen[0].init.body))).toEqual({
			model: "grok-4.3",
			instructions: "policy",
			input: "hello",
			max_output_tokens: 700,
		});
		expect(r.text).toBe('{"parts":[]}');
		expect(r.usage).toEqual({
			modelId: "grok-4.3",
			provider: "xai",
			inputTokens: 32,
			cachedInputTokens: 12,
			outputTokens: 9,
			thinkingTokens: 110,
			finishReason: "completed",
		});
	});

	test("omits instructions when there is no system policy", async () => {
		const seen: Seen[] = [];
		await generateGrokText(
			{ entry: grok, prompt: "p" },
			KEY,
			undefined,
			fakeFetch(() => json(okBody), seen),
		);
		const body = JSON.parse(String(seen[0].init.body));
		expect(body.instructions).toBeUndefined();
		expect(body.max_output_tokens).toBe(2048);
	});

	test("missing usage maps to zeros", async () => {
		const r = await generateGrokText(
			{ entry: grok, prompt: "p" },
			KEY,
			undefined,
			fakeFetch(() => json({ output: [] })),
		);
		expect(r.text).toBe("");
		expect(r.usage.inputTokens).toBe(0);
		expect(r.usage.thinkingTokens).toBe(0);
	});

	test("a 503 throws a retryable error and logs status, model, 300 chars of body, no headers", async () => {
		const longBody = `upstream said: ${"x ".repeat(400)}`;
		const err = await generateGrokText(
			{ entry: grok, prompt: "SECRET PROMPT" },
			KEY,
			undefined,
			fakeFetch(() => new Response(longBody, { status: 503 })),
		).catch((e) => e);
		expect(err).toBeInstanceOf(GrokApiError);
		expect(err.status).toBe(503);
		expect(err.message).not.toContain("upstream");
		expect(classifyProviderError(err)).toBe("retryable");

		expect(warns).toHaveLength(1);
		const meta = (warns[0].opts as { metadata: Record<string, unknown> })
			.metadata;
		expect(meta.status).toBe(503);
		expect(meta.provider).toBe("xai");
		expect(meta.modelId).toBe("grok-4.3");
		expect((meta.body as string).length).toBeLessThanOrEqual(300);
		const logged = JSON.stringify(warns);
		expect(logged).not.toContain(KEY);
		expect(logged).not.toMatch(/bearer|authorization/i);
		expect(logged).not.toContain("SECRET PROMPT");
	});

	test("a 401 is fatal", async () => {
		const err = await generateGrokText(
			{ entry: grok, prompt: "p" },
			KEY,
			undefined,
			fakeFetch(() => new Response("no", { status: 401 })),
		).catch((e) => e);
		expect(classifyProviderError(err)).toBe("fatal");
	});

	test("an aborted signal rejects", async () => {
		const c = new AbortController();
		const f = (async (_u: unknown, init?: RequestInit) => {
			if (init?.signal?.aborted) throw new DOMException("x", "AbortError");
			return json(okBody);
		}) as typeof fetch;
		c.abort();
		const err = await generateGrokText(
			{ entry: grok, prompt: "p" },
			KEY,
			c.signal,
			f,
		).catch((e) => e);
		expect(classifyProviderError(err)).toBe("retryable");
	});
});

describe("Grok through generateAssignedText", () => {
	const input = { purpose: "avatar_chat" as const, prompt: "p", system: "s" };
	const geminiResult = (id: string) => ({
		text: "{}",
		usage: {
			modelId: id,
			provider: "gemini" as const,
			inputTokens: 1,
			cachedInputTokens: 0,
			outputTokens: 1,
			thinkingTokens: 0,
		},
	});

	test("a Grok 5xx fails over to Gemini once", async () => {
		process.env.XAI_API_KEY = KEY;
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "g";
		const called: string[] = [];
		const r = await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({
					avatar_chat: "grok-4.3",
					fallback: { avatar_chat: "gemini-flash-latest" },
				}),
			generate: async (i) => {
				called.push(i.entry.id);
				if (i.entry.provider === "xai") {
					return generateGrokText(
						i,
						KEY,
						undefined,
						fakeFetch(() => new Response("boom", { status: 502 })),
					);
				}
				return geminiResult(i.entry.id);
			},
		});
		expect(called).toEqual(["grok-4.3", "gemini-flash-latest"]);
		expect(r.usedFallback).toBe(true);
		expect(r.attempts.map((a) => [a.attempt, a.errorStatus])).toEqual([
			[1, 502],
			[2, undefined],
		]);
	});

	test("Grok assigned with the key removed runs on gemini-flash-latest and warns", async () => {
		delete process.env.XAI_API_KEY;
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "g";
		const r = await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({ avatar_chat: "grok-4.7" }),
			generate: async (i) => geminiResult(i.entry.id),
		});
		expect(r.modelId).toBe("gemini-flash-latest");
		expect(warns[0].message).toBe(
			"AI assigned model unusable, running on Gemini Flash",
		);
	});

	test("generateContent sends a Grok entry to the adapter and needs the key", async () => {
		delete process.env.XAI_API_KEY;
		const err = await generateContent({ entry: grok, prompt: "p" }).catch(
			(e) => e,
		);
		expect(err.name).toBe("AiNotConfiguredError");
	});
});

describe("provider usability", () => {
	test("Grok is usable only once its key is set", () => {
		delete process.env.XAI_API_KEY;
		expect(hasUsableProviderKey("xai")).toBe(false);
		process.env.XAI_API_KEY = KEY;
		expect(hasUsableProviderKey("xai")).toBe(true);
	});
});
