export type ProviderErrorClass = "retryable" | "fatal";

/** Thrown when a provider call exceeds its `timeoutMs`. */
export class AiTimeoutError extends Error {
	constructor(message = "AI provider call timed out") {
		super(message);
		this.name = "AiTimeoutError";
	}
}

const NETWORK_CODES = new Set([
	"ECONNRESET",
	"ECONNREFUSED",
	"ETIMEDOUT",
	"ENOTFOUND",
	"EAI_AGAIN",
	"UND_ERR_CONNECT_TIMEOUT",
]);

/** SDK timeout and abort errors, matched by name because the classes are provider specific. */
const TIMEOUT_ERROR_NAMES = new Set([
	"APIConnectionTimeoutError",
	"AbortError",
	"GoogleGenerativeAIAbortError",
]);

/** Status carried by an SDK error, whichever field it uses. */
export function providerErrorStatus(err: unknown): number | undefined {
	if (err == null || typeof err !== "object") return undefined;
	const e = err as {
		status?: unknown;
		statusCode?: unknown;
		response?: { status?: unknown };
	};
	return [e.status, e.statusCode, e.response?.status].find(
		(s): s is number => typeof s === "number",
	);
}

/**
 * Timeout, 429, 5xx and network errors are `retryable` (the fallback runs once).
 * Everything else, including 400, 401 and 403, is `fatal`.
 */
export function classifyProviderError(err: unknown): ProviderErrorClass {
	if (err instanceof AiTimeoutError) return "retryable";
	if (err == null || typeof err !== "object") return "fatal";
	if (TIMEOUT_ERROR_NAMES.has((err as { name?: string }).name ?? "")) {
		return "retryable";
	}
	const status = providerErrorStatus(err);
	if (status !== undefined) {
		return status === 429 || status >= 500 ? "retryable" : "fatal";
	}
	const e = err as { code?: unknown; cause?: { code?: unknown } };
	const code = e.code ?? e.cause?.code;
	if (typeof code === "string" && NETWORK_CODES.has(code)) return "retryable";
	if (err instanceof TypeError && /fetch failed|network/i.test(err.message)) {
		return "retryable";
	}
	return "fatal";
}
