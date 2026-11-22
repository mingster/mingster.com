import logger from "@/lib/logger";
import {
	classifyProviderError,
	providerErrorStatus,
} from "./classify-provider-error";
import {
	type AttemptUsage,
	AiNotConfiguredError,
	type GenerateContentInput,
	type GenerateContentResultText,
	generateContent,
} from "./generate-content";
import { loadAiModelAssignment } from "./load-ai-model-assignment";
import type { AiModelAssignment, ModelCatalogEntry } from "./model-catalog";
import { hasUsableProviderKey } from "./provider-env-keys";
import type { AiProvider, AiPurpose } from "./providers";
import { resolveAiModelForPurpose } from "./resolve-ai-model-for-purpose";

export interface GenerateAssignedTextResult {
	text: string;
	modelId: string;
	provider: AiProvider;
	usedFallback: boolean;
	attempts: AttemptUsage[];
}

/** Every attempt failed. Carries the attempts so the caller still logs their cost lines. */
export class AiGenerationError extends Error {
	readonly attempts: AttemptUsage[];
	readonly cause: unknown;
	/** True when the provider key is missing, so nothing was sent. */
	readonly notConfigured: boolean;
	constructor(cause: unknown, attempts: AttemptUsage[]) {
		super("AI generation failed");
		this.name = "AiGenerationError";
		this.cause = cause;
		this.attempts = attempts;
		this.notConfigured = cause instanceof AiNotConfiguredError;
	}
}

export interface GenerateAssignedTextInput {
	purpose: AiPurpose;
	/** Trusted policy only. */
	system?: string;
	/** Corpus, then history as untrusted data, then the message last. */
	prompt: string;
	timeoutMs?: number;
	maxOutputTokens?: number;
}

export interface GenerateAssignedTextDeps {
	generate?: (i: GenerateContentInput) => Promise<GenerateContentResultText>;
	loadAssignment?: () => Promise<AiModelAssignment>;
}

/**
 * Resolves the assigned model, calls it, and on a timeout, 429 or 5xx tries the
 * configured fallback once. Throws {@link AiGenerationError} when no attempt works.
 */
export async function generateAssignedText(
	input: GenerateAssignedTextInput,
	deps: GenerateAssignedTextDeps = {},
): Promise<GenerateAssignedTextResult> {
	const generate = deps.generate ?? generateContent;
	const assignment = await (deps.loadAssignment ?? loadAiModelAssignment)();
	const resolved = resolveAiModelForPurpose({
		purpose: input.purpose,
		assignment,
		hasProviderKey: hasUsableProviderKey,
	});
	if (resolved.unusableAssigned) {
		// No key value is logged, only which provider lacks one.
		logger.warn("AI assigned model unusable, running on Gemini Flash", {
			metadata: {
				purpose: input.purpose,
				assignedModelId: resolved.unusableAssigned.id,
				provider: resolved.unusableAssigned.provider,
				usedModelId: resolved.entry.id,
			},
			tags: ["ai", "fallback"],
		});
	}
	const attempts: AttemptUsage[] = [];

	const run = async (entry: ModelCatalogEntry, usedFallback: boolean) => {
		const attempt = attempts.length + 1;
		const started = Date.now();
		try {
			const result = await generate({
				entry,
				prompt: input.prompt,
				system: input.system,
				timeoutMs: input.timeoutMs,
				maxOutputTokens: input.maxOutputTokens,
			});
			attempts.push({
				...result.usage,
				usedFallback,
				attempt,
				modelMs: Date.now() - started,
			});
			return {
				text: result.text,
				modelId: entry.id,
				provider: entry.provider,
				usedFallback,
				attempts,
			};
		} catch (err) {
			attempts.push({
				modelId: entry.id,
				provider: entry.provider,
				usedFallback,
				attempt,
				inputTokens: 0,
				cachedInputTokens: 0,
				outputTokens: 0,
				thinkingTokens: 0,
				modelMs: Date.now() - started,
				errorName: err instanceof Error ? err.name : "unknown",
				errorStatus: providerErrorStatus(err),
			});
			throw err;
		}
	};

	try {
		return await run(resolved.entry, resolved.usedFallback);
	} catch (err) {
		const fallback = resolved.fallbackEntry;
		if (!fallback || classifyProviderError(err) !== "retryable") {
			throw new AiGenerationError(err, attempts);
		}
		try {
			return await run(fallback, true);
		} catch (fallbackErr) {
			throw new AiGenerationError(fallbackErr, attempts);
		}
	}
}
