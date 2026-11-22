import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import Anthropic from "@anthropic-ai/sdk";

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

const { generateAnthropicText } = await import("../generate-anthropic-text");
const { generateContent } = await import("../generate-content");
const { generateAssignedText } = await import(
	"../generate-assigned-text.server"
);
const { parseAiModelAssignment, getModelCatalogEntry } = await import(
	"../model-catalog"
);

const haiku = getModelCatalogEntry("claude-haiku-5-5");
const sonnet = getModelCatalogEntry("claude-sonnet-5-5");
if (!haiku || !sonnet) throw new Error("catalog");

const okBody = {
	id: "msg_1",
	type: "message",
	role: "assistant",
	model: "claude-haiku-5-5",
	content: [
		{ type: "thinking", thinking: "hmm", signature: "s" },
		{ type: "text", text: '{"parts":[]}' },
	],
	stop_reason: "end_turn",
	stop_sequence: null,
	usage: {
		input_tokens: 100,
		cache_read_input_tokens: 400,
		cache_creation_input_tokens: 50,
		output_tokens: 70,
		output_tokens_details: { thinking_tokens: 20 },
	},
};

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});

const overloaded = () =>
	json({ type: "error", error: { type: "api_error", message: "busy" } }, 500);

/** A real SDK client whose network is a fake fetch. Nothing leaves the process. */
function clientWith(respond: () => Response, seen: Request[] = []) {
	return new Anthropic({
		apiKey: "sk-ant-fake",
		maxRetries: 0,
		fetch: (async (url: unknown, init?: RequestInit) => {
			seen.push(new Request(url as string, init));
			return respond();
		}) as typeof fetch,
	});
}

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

const saved = { ...process.env };
beforeEach(() => {
	warns.length = 0;
});
afterEach(() => {
	process.env = { ...saved };
});

describe("generateAnthropicText", () => {
	test("sends system, effort low and no thinking for Haiku; maps text and usage", async () => {
		const seen: Request[] = [];
		const r = await generateAnthropicText(
			{ entry: haiku, prompt: "hello", system: "policy", maxOutputTokens: 900 },
			"sk-ant-fake",
			undefined,
			clientWith(() => json(okBody), seen),
		);
		const body = await seen[0].json();
		expect(seen).toHaveLength(1);
		expect(new URL(seen[0].url).pathname).toBe("/v1/messages");
		expect(body).toMatchObject({
			model: "claude-haiku-5-5",
			system: "policy",
			max_tokens: 900,
			output_config: { effort: "low" },
			thinking: { type: "disabled" },
			messages: [{ role: "user", content: "hello" }],
		});
		expect(r.text).toBe('{"parts":[]}');
		expect(r.usage).toEqual({
			modelId: "claude-haiku-5-5",
			provider: "anthropic",
			inputTokens: 550,
			cachedInputTokens: 400,
			outputTokens: 50,
			thinkingTokens: 20,
			finishReason: "end_turn",
		});
	});

	test("Sonnet leaves thinking at its default", async () => {
		const seen: Request[] = [];
		await generateAnthropicText(
			{ entry: sonnet, prompt: "p" },
			"k",
			undefined,
			clientWith(() => json(okBody), seen),
		);
		const body = await seen[0].json();
		expect(body.thinking).toBeUndefined();
		expect(body.max_tokens).toBe(2048);
		expect(body.system).toBeUndefined();
	});

	test("a 500 throws with its status, makes one request, logs no key", async () => {
		const seen: Request[] = [];
		const err = await generateAnthropicText(
			{ entry: haiku, prompt: "p" },
			"sk-ant-fake",
			undefined,
			clientWith(overloaded, seen),
		).catch((e) => e);
		expect(err.status).toBe(500);
		expect(seen).toHaveLength(1);
		expect(JSON.stringify(warns)).not.toContain("sk-ant");
		expect(warns[0].message).toBe("Claude call failed");
	});

	test("an aborted signal rejects", async () => {
		const c = new AbortController();
		c.abort();
		const err = await generateAnthropicText(
			{ entry: haiku, prompt: "p" },
			"k",
			c.signal,
			clientWith(() => json(okBody)),
		).catch((e) => e);
		expect(err).toBeInstanceOf(Error);
	});
});

describe("Claude through generateAssignedText", () => {
	const input = { purpose: "avatar_chat" as const, prompt: "p", system: "s" };

	test("a Claude 5xx fails over to Gemini once", async () => {
		process.env.ANTHROPIC_API_KEY = "sk-ant-fake";
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "g";
		const called: string[] = [];
		const r = await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({
					avatar_chat: "claude-haiku-5-5",
					fallback: { avatar_chat: "gemini-flash-latest" },
				}),
			generate: async (i) => {
				called.push(i.entry.id);
				if (i.entry.provider === "anthropic") {
					return generateAnthropicText(
						i,
						"sk-ant-fake",
						undefined,
						clientWith(overloaded),
					);
				}
				return geminiResult(i.entry.id);
			},
		});
		expect(called).toEqual(["claude-haiku-5-5", "gemini-flash-latest"]);
		expect(r.modelId).toBe("gemini-flash-latest");
		expect(r.usedFallback).toBe(true);
		expect(r.attempts.map((a) => [a.attempt, a.errorStatus])).toEqual([
			[1, 500],
			[2, undefined],
		]);
	});

	test("case 5: Claude assigned, key removed: runs on gemini-flash-latest and warns", async () => {
		delete process.env.ANTHROPIC_API_KEY;
		process.env.GOOGLE_GENERATIVE_AI_API_KEY = "g";
		const called: string[] = [];
		const r = await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({ avatar_chat: "claude-sonnet-5-5" }),
			generate: async (i) => {
				called.push(i.entry.id);
				return geminiResult(i.entry.id);
			},
		});
		expect(called).toEqual(["gemini-flash-latest"]);
		expect(r.usedFallback).toBe(true);
		expect(warns[0].message).toBe(
			"AI assigned model unusable, running on Gemini Flash",
		);
		expect(JSON.stringify(warns[0].opts)).toContain("claude-sonnet-5-5");
	});

	test("generateContent sends a Claude entry to the adapter and needs the key", async () => {
		delete process.env.ANTHROPIC_API_KEY;
		const err = await generateContent({ entry: haiku, prompt: "p" }).catch(
			(e) => e,
		);
		expect(err.name).toBe("AiNotConfiguredError");
	});
});

describe("provider usability (case 10)", () => {
	test("Claude is usable only once its key is set", async () => {
		const { hasUsableProviderKey } = await import("../provider-env-keys");
		delete process.env.ANTHROPIC_API_KEY;
		expect(hasUsableProviderKey("anthropic")).toBe(false);
		process.env.ANTHROPIC_API_KEY = "sk-ant-fake";
		expect(hasUsableProviderKey("anthropic")).toBe(true);
		expect(hasUsableProviderKey("xai")).toBe(false);
	});
});
