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

const { generateAssignedText, AiGenerationError } = await import(
	"../generate-assigned-text.server"
);
const { AiTimeoutError } = await import("../classify-provider-error");
const { parseAiModelAssignment } = await import("../model-catalog");
const { AiNotConfiguredError } = await import("../generate-content");

const usage = (modelId: string, provider = "gemini") => ({
	modelId,
	provider: provider as "gemini",
	inputTokens: 10,
	cachedInputTokens: 2,
	outputTokens: 5,
	thinkingTokens: 1,
});

const saved = { ...process.env };
beforeEach(() => {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-gemini";
	process.env.ANTHROPIC_API_KEY = "test-claude";
});
afterEach(() => {
	process.env = { ...saved };
});

const input = { purpose: "avatar_chat" as const, prompt: "p", system: "s" };

describe("generateAssignedText", () => {
	test("runs the default model and reports one attempt", async () => {
		const r = await generateAssignedText(input, {
			loadAssignment: async () => parseAiModelAssignment(null),
			generate: async ({ entry }) => ({
				text: "{}",
				usage: usage(entry.id),
			}),
		});
		expect(r.modelId).toBe("gemini-flash-latest");
		expect(r.usedFallback).toBe(false);
		expect(r.attempts).toHaveLength(1);
		expect(r.attempts[0]).toMatchObject({
			attempt: 1,
			inputTokens: 10,
			cachedInputTokens: 2,
			outputTokens: 5,
			thinkingTokens: 1,
		});
	});

	test("a Grok assignment runs on Gemini until its adapter lands", async () => {
		process.env.XAI_API_KEY = "test-xai";
		const r = await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({ avatar_chat: "grok-4.3" }),
			generate: async ({ entry }) => ({ text: "{}", usage: usage(entry.id) }),
		});
		expect(r.modelId).toBe("gemini-flash-latest");
		expect(r.usedFallback).toBe(true);
	});

	test("a fallback because the key is missing logs a warning without the key", async () => {
		warns.length = 0;
		delete process.env.XAI_API_KEY;
		await generateAssignedText(input, {
			loadAssignment: async () =>
				parseAiModelAssignment({ avatar_chat: "grok-4.3" }),
			generate: async ({ entry }) => ({ text: "{}", usage: usage(entry.id) }),
		});
		expect(warns).toHaveLength(1);
		const logged = JSON.stringify(warns[0]);
		expect(logged).toContain("grok-4.3");
		expect(logged).toContain("xai");
		expect(logged).toContain("gemini-flash-latest");
		expect(logged).not.toContain("test-gemini");
		expect(logged).not.toContain("test-claude");
	});

	test("no warning when the assigned model is used", async () => {
		warns.length = 0;
		await generateAssignedText(input, {
			loadAssignment: async () => parseAiModelAssignment(null),
			generate: async ({ entry }) => ({ text: "{}", usage: usage(entry.id) }),
		});
		expect(warns).toHaveLength(0);
	});

	test("fails over once to a configured fallback on a timeout", async () => {
		const called: string[] = [];
		process.env.ANTHROPIC_API_KEY = "test-claude";
		{
			const r = await generateAssignedText(input, {
				loadAssignment: async () =>
					parseAiModelAssignment({
						avatar_chat: "gemini-pro-latest",
						fallback: { avatar_chat: "claude-haiku-5-5" },
					}),
				generate: async ({ entry }) => {
					called.push(entry.id);
					if (entry.provider === "gemini") throw new AiTimeoutError();
					return { text: "{}", usage: usage(entry.id, "anthropic") };
				},
			});
			expect(called).toEqual(["gemini-pro-latest", "claude-haiku-5-5"]);
			expect(r.usedFallback).toBe(true);
			expect(r.attempts.map((a) => a.attempt)).toEqual([1, 2]);
			expect(r.attempts[0].errorName).toBe("AiTimeoutError");
		}
	});

	test("no fallback configured: the error carries its attempt", async () => {
		const err = await generateAssignedText(input, {
			loadAssignment: async () => parseAiModelAssignment(null),
			generate: async () => {
				throw Object.assign(new Error("boom"), { status: 503 });
			},
		}).catch((e) => e);
		expect(err).toBeInstanceOf(AiGenerationError);
		expect(err.attempts).toHaveLength(1);
		expect(err.attempts[0].errorStatus).toBe(503);
		expect(err.notConfigured).toBe(false);
	});

	test("a fatal error does not fail over", async () => {
		let calls = 0;
		await generateAssignedText(input, {
			loadAssignment: async () => parseAiModelAssignment(null),
			generate: async () => {
				calls++;
				throw Object.assign(new Error("bad"), { status: 400 });
			},
		}).catch(() => {});
		expect(calls).toBe(1);
	});

	test("missing key surfaces as notConfigured (case 22)", async () => {
		delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		delete process.env.GEMINI_API_KEY;
		const err = await generateAssignedText(input, {
			loadAssignment: async () => parseAiModelAssignment(null),
		}).catch((e) => e);
		expect(err).toBeInstanceOf(AiGenerationError);
		expect(err.notConfigured).toBe(true);
		expect(err.cause).toBeInstanceOf(AiNotConfiguredError);
	});
});
