import logger from "@/lib/logger";
import { sanitizeForLog } from "@/utils/sanitize-for-log";
import type {
	GenerateContentInput,
	GenerateContentResultText,
} from "./generate-content";

const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
const DEFAULT_MAX_OUTPUT_TOKENS = 2048;
/** Most of an error response body that is ever logged. */
const MAX_LOGGED_BODY_CHARS = 300;

/**
 * Non 2xx answer from xAI. Carries only the status, so the classifier can read it
 * and no provider text can reach a user or a log by way of the message.
 */
export class GrokApiError extends Error {
	readonly status: number;
	constructor(status: number) {
		super(`xAI request failed with status ${status}`);
		this.name = "GrokApiError";
		this.status = status;
	}
}

interface XaiResponse {
	status?: string;
	output?: {
		content?: { type?: string; text?: string }[];
	}[];
	usage?: {
		input_tokens?: number;
		input_tokens_details?: { cached_tokens?: number };
		output_tokens?: number;
		output_tokens_details?: { reasoning_tokens?: number };
	};
}

function count(value: number | undefined): number {
	return Math.max(0, Math.trunc(value ?? 0));
}

/**
 * One Grok call over plain `fetch` (no SDK, no OpenAI package). The request
 * options and headers carry the bearer token and are never logged: an error
 * line holds the status, provider, model id and at most 300 chars of the body.
 *
 * Token mapping: xAI reports reasoning tokens apart from `output_tokens`
 * (the docs example sums input + output + reasoning to total), so
 * `thinkingTokens` is the reasoning count and `outputTokens` is left as reported.
 */
export async function generateGrokText(
	input: GenerateContentInput,
	apiKey: string,
	signal?: AbortSignal,
	fetchImpl: typeof fetch = fetch,
): Promise<GenerateContentResultText> {
	const response = await fetchImpl(XAI_RESPONSES_URL, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: input.entry.id,
			...(input.system ? { instructions: input.system } : {}),
			input: input.prompt,
			max_output_tokens: input.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
		}),
		...(signal ? { signal } : {}),
	});

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		logger.warn("Grok call failed", {
			metadata: {
				provider: "xai",
				modelId: input.entry.id,
				status: response.status,
				body: sanitizeForLog(body.slice(0, MAX_LOGGED_BODY_CHARS)).slice(
					0,
					MAX_LOGGED_BODY_CHARS,
				),
			},
			tags: ["ai", "provider-error"],
		});
		throw new GrokApiError(response.status);
	}

	const data = (await response.json()) as XaiResponse;
	const text = (data.output ?? [])
		.flatMap((item) => item.content ?? [])
		.flatMap((part) =>
			part.type === "output_text" && typeof part.text === "string"
				? [part.text]
				: [],
		)
		.join("");
	const u = data.usage;
	return {
		text,
		usage: {
			modelId: input.entry.id,
			provider: "xai",
			inputTokens: count(u?.input_tokens),
			cachedInputTokens: count(u?.input_tokens_details?.cached_tokens),
			outputTokens: count(u?.output_tokens),
			thinkingTokens: count(u?.output_tokens_details?.reasoning_tokens),
			finishReason: data.status,
		},
	};
}
