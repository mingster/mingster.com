import { describe, expect, test } from "bun:test";
import {
	AiTimeoutError,
	classifyProviderError,
} from "../classify-provider-error";
import { parseAssignmentFromSettingsJson } from "../load-ai-model-assignment";
import {
	DEFAULT_AI_MODEL_ASSIGNMENT,
	MODEL_CATALOG,
	parseAiModelAssignment,
} from "../model-catalog";
import { resolveAiModelForPurpose } from "../resolve-ai-model-for-purpose";

const allKeys = () => true;
const geminiOnly = (p: string) => p === "gemini";

describe("catalog", () => {
	test("holds the seven spec ids", () => {
		expect(MODEL_CATALOG.map((m) => m.id)).toEqual([
			"gemini-flash-latest",
			"gemini-pro-latest",
			"claude-haiku-5-5",
			"claude-sonnet-5-5",
			"claude-opus-5-5",
			"grok-4.3",
			"grok-4.7",
		]);
	});
});

describe("parseAiModelAssignment", () => {
	test("defaults on null and junk", () => {
		expect(parseAiModelAssignment(null)).toEqual(DEFAULT_AI_MODEL_ASSIGNMENT);
		expect(parseAiModelAssignment([1])).toEqual(DEFAULT_AI_MODEL_ASSIGNMENT);
	});
	test("reads assigned and fallback, and remaps retired ids", () => {
		const a = parseAiModelAssignment({
			avatar_chat: "gemini-2.5-pro",
			fallback: { avatar_chat: "claude-haiku-5-5" },
		});
		expect(a.assigned.avatar_chat).toBe("gemini-pro-latest");
		expect(a.fallback.avatar_chat).toBe("claude-haiku-5-5");
	});
});

describe("parseAssignmentFromSettingsJson (case 7)", () => {
	test("no row, no entry or bad JSON gives gemini-flash-latest", () => {
		for (const raw of [
			null,
			undefined,
			"",
			"not json",
			'[{"label":"Support.Email","value":"a@b.c"}]',
		]) {
			expect(parseAssignmentFromSettingsJson(raw).assigned.avatar_chat).toBe(
				"gemini-flash-latest",
			);
		}
	});
	test("reads the AI.ModelAssignment entry next to other entries", () => {
		const raw = JSON.stringify([
			{ label: "Support.Email", value: "a@b.c" },
			{
				label: "AI.ModelAssignment",
				value: JSON.stringify({ avatar_chat: "gemini-pro-latest" }),
			},
		]);
		expect(parseAssignmentFromSettingsJson(raw).assigned.avatar_chat).toBe(
			"gemini-pro-latest",
		);
	});
});

describe("resolveAiModelForPurpose", () => {
	test("default resolves to Gemini Flash with no fallback", () => {
		const r = resolveAiModelForPurpose({
			purpose: "avatar_chat",
			hasProviderKey: allKeys,
		});
		expect(r.entry.id).toBe("gemini-flash-latest");
		expect(r.fallbackEntry).toBeUndefined();
		expect(r.usedFallback).toBe(false);
	});
	test("assigned provider without a key runs on Gemini Flash", () => {
		const r = resolveAiModelForPurpose({
			purpose: "avatar_chat",
			assignment: parseAiModelAssignment({ avatar_chat: "claude-haiku-5-5" }),
			hasProviderKey: geminiOnly,
		});
		expect(r.entry.id).toBe("gemini-flash-latest");
		expect(r.usedFallback).toBe(true);
	});
	test("fallback is only used when configured, on another provider, with a key", () => {
		const assignment = parseAiModelAssignment({
			avatar_chat: "gemini-pro-latest",
			fallback: { avatar_chat: "claude-haiku-5-5" },
		});
		expect(
			resolveAiModelForPurpose({
				purpose: "avatar_chat",
				assignment,
				hasProviderKey: allKeys,
			}).fallbackEntry?.id,
		).toBe("claude-haiku-5-5");
		expect(
			resolveAiModelForPurpose({
				purpose: "avatar_chat",
				assignment,
				hasProviderKey: geminiOnly,
			}).fallbackEntry,
		).toBeUndefined();
		const sameProvider = parseAiModelAssignment({
			avatar_chat: "gemini-pro-latest",
			fallback: { avatar_chat: "gemini-flash-latest" },
		});
		expect(
			resolveAiModelForPurpose({
				purpose: "avatar_chat",
				assignment: sameProvider,
				hasProviderKey: allKeys,
			}).fallbackEntry,
		).toBeUndefined();
	});
});

describe("classifyProviderError", () => {
	test("timeout, 429, 5xx and network are retryable", () => {
		expect(classifyProviderError(new AiTimeoutError())).toBe("retryable");
		expect(classifyProviderError({ status: 429 })).toBe("retryable");
		expect(classifyProviderError({ status: 503 })).toBe("retryable");
		expect(classifyProviderError({ code: "ECONNRESET" })).toBe("retryable");
	});
	test("400, 401 and unknown are fatal", () => {
		expect(classifyProviderError({ status: 400 })).toBe("fatal");
		expect(classifyProviderError({ status: 401 })).toBe("fatal");
		expect(classifyProviderError(new Error("x"))).toBe("fatal");
	});
});
