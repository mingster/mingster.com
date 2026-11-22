import Anthropic from "@anthropic-ai/sdk";
import logger from "@/lib/logger";
import { sanitizeForLog } from "@/utils/sanitize-for-log";
import { providerErrorStatus } from "./classify-provider-error";
import type {
	GenerateContentInput,
	GenerateContentResultText,
} from "./generate-content";

const DEFAULT_MAX_TOKENS = 2048;

function count(value: number | null | undefined): number {
	return Math.max(0, Math.trunc(value ?? 0));
}

/**
 * One Claude call. `maxRetries: 0` because failover is the caller's job, and the
 * abort signal comes from the caller's AbortController. Effort is low for chat.
 * Haiku 5.5 can turn thinking off; Sonnet and Opus 5.5 cannot, so they keep the default.
 *
 * Token mapping: `inputTokens` is the whole prompt (fresh plus cache reads plus cache
 * writes) with `cachedInputTokens` the cache read part, the same shape Gemini reports.
 * `outputTokens` excludes thinking tokens, which are reported on their own.
 */
export async function generateAnthropicText(
	input: GenerateContentInput,
	apiKey: string,
	signal?: AbortSignal,
	client: Anthropic = new Anthropic({ apiKey, maxRetries: 0 }),
): Promise<GenerateContentResultText> {
	try {
		const message = await client.messages.create(
			{
				model: input.entry.id,
				max_tokens: input.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
				...(input.system ? { system: input.system } : {}),
				messages: [{ role: "user", content: input.prompt }],
				output_config: { effort: "low" },
				...(input.entry.id === "claude-haiku-5-5"
					? { thinking: { type: "disabled" as const } }
					: {}),
			},
			signal ? { signal } : undefined,
		);
		const text = message.content
			.flatMap((block) => (block.type === "text" ? [block.text] : []))
			.join("");
		const u = message.usage;
		const cached = count(u.cache_read_input_tokens);
		const thinking = count(u.output_tokens_details?.thinking_tokens);
		return {
			text,
			usage: {
				modelId: input.entry.id,
				provider: "anthropic",
				inputTokens:
					count(u.input_tokens) + cached + count(u.cache_creation_input_tokens),
				cachedInputTokens: cached,
				outputTokens: Math.max(0, count(u.output_tokens) - thinking),
				thinkingTokens: thinking,
				finishReason: message.stop_reason ?? undefined,
			},
		};
	} catch (err) {
		logger.warn("Claude call failed", {
			metadata: {
				provider: "anthropic",
				modelId: input.entry.id,
				errorName: err instanceof Error ? err.name : "unknown",
				status: providerErrorStatus(err),
				error: sanitizeForLog(err),
			},
			tags: ["ai", "provider-error"],
		});
		throw err;
	}
}
