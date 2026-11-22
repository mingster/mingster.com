import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiTimeoutError } from "./classify-provider-error";
import type { ModelCatalogEntry } from "./model-catalog";
import { getProviderApiKey } from "./provider-env-keys";
import type { AiProvider } from "./providers";

/** Usage and timing of one model call, logged per attempt (case 21). */
export interface AttemptUsage {
	modelId: string;
	provider: AiProvider;
	/** True for the failover, or when Gemini Flash stood in for the assigned model. */
	usedFallback: boolean;
	/** 1 for the assigned model, 2 for the failover. */
	attempt: number;
	inputTokens: number;
	cachedInputTokens: number;
	outputTokens: number;
	thinkingTokens: number;
	modelMs: number;
	finishReason?: string;
	/** Set when the attempt threw: error name and HTTP status only. */
	errorName?: string;
	errorStatus?: number;
}

export type CallUsage = Omit<
	AttemptUsage,
	"attempt" | "modelMs" | "usedFallback"
>;

export interface GenerateContentResultText {
	text: string;
	usage: CallUsage;
}

export interface GenerateContentInput {
	entry: ModelCatalogEntry;
	prompt: string;
	/** Trusted policy, sent on the provider's system channel and kept apart from the prompt. */
	system?: string;
	/** Abort the call after this many ms. */
	timeoutMs?: number;
	maxOutputTokens?: number;
}

/** The provider key is not set, or the provider has no adapter yet. */
export class AiNotConfiguredError extends Error {
	constructor(reason: string) {
		super(reason);
		this.name = "AiNotConfiguredError";
	}
}

function count(value: number | undefined): number {
	return Math.max(0, Math.trunc(value ?? 0));
}

async function generateGeminiText(
	input: GenerateContentInput,
	apiKey: string,
	signal?: AbortSignal,
): Promise<GenerateContentResultText> {
	const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
		model: input.entry.id,
		...(input.system ? { systemInstruction: input.system } : {}),
		generationConfig: {
			responseMimeType: "application/json",
			...(input.maxOutputTokens
				? { maxOutputTokens: input.maxOutputTokens }
				: {}),
		},
	});
	const result = signal
		? await model.generateContent(input.prompt, { signal })
		: await model.generateContent(input.prompt);
	const response = result.response;
	const usage = response.usageMetadata as
		| {
				promptTokenCount?: number;
				cachedContentTokenCount?: number;
				candidatesTokenCount?: number;
				thoughtsTokenCount?: number;
		  }
		| undefined;
	return {
		text: response.text(),
		usage: {
			modelId: input.entry.id,
			provider: "gemini",
			inputTokens: count(usage?.promptTokenCount),
			cachedInputTokens: count(usage?.cachedContentTokenCount),
			outputTokens: count(usage?.candidatesTokenCount),
			thinkingTokens: count(usage?.thoughtsTokenCount),
			finishReason: response.candidates?.[0]?.finishReason,
		},
	};
}

async function generateContentOnce(
	input: GenerateContentInput,
	signal?: AbortSignal,
): Promise<GenerateContentResultText> {
	const apiKey = getProviderApiKey(input.entry.provider);
	if (!apiKey) {
		throw new AiNotConfiguredError(
			`No API key for provider ${input.entry.provider}`,
		);
	}
	switch (input.entry.provider) {
		case "gemini":
			return generateGeminiText(input, apiKey, signal);
		default:
			throw new AiNotConfiguredError(
				`Provider ${input.entry.provider} has no adapter yet`,
			);
	}
}

/**
 * One model call. The timer aborts the request through the SDK signal and the
 * race rejects with {@link AiTimeoutError} even if an SDK ignores the signal.
 */
export async function generateContent(
	input: GenerateContentInput,
): Promise<GenerateContentResultText> {
	if (!input.timeoutMs) return generateContentOnce(input);
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			controller.abort();
			reject(new AiTimeoutError());
		}, input.timeoutMs);
	});
	try {
		return await Promise.race([
			generateContentOnce(input, controller.signal),
			timeout,
		]);
	} finally {
		clearTimeout(timer);
	}
}
