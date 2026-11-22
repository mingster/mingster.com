import type { AiProvider, AiPurpose } from "./providers";
import { AI_PURPOSES } from "./providers";

export interface ModelCatalogEntry {
	readonly id: string;
	readonly provider: AiProvider;
	readonly displayLabel: string;
}

/** Gemini default when the assignment is missing or its provider has no key. */
export const GEMINI_FALLBACK_CATALOG_ID = "gemini-flash-latest";

/** Retired catalog ids mapped to the current id that replaces them. */
export const RETIRED_CATALOG_IDS: Readonly<Record<string, string>> = {
	"gemini-2.5-flash": "gemini-flash-latest",
	"gemini-2.5-pro": "gemini-pro-latest",
};

/** Code versioned catalog. The assignment can only name these ids. */
export const MODEL_CATALOG = [
	{
		id: "gemini-flash-latest",
		provider: "gemini",
		displayLabel: "Gemini Flash (latest)",
	},
	{
		id: "gemini-pro-latest",
		provider: "gemini",
		displayLabel: "Gemini Pro (latest)",
	},
	{
		id: "claude-haiku-5-5",
		provider: "anthropic",
		displayLabel: "Claude Haiku 5.5",
	},
	{
		id: "claude-sonnet-5-5",
		provider: "anthropic",
		displayLabel: "Claude Sonnet 5.5",
	},
	{
		id: "claude-opus-5-5",
		provider: "anthropic",
		displayLabel: "Claude Opus 5.5",
	},
	{ id: "grok-4.3", provider: "xai", displayLabel: "Grok 4.3" },
	{ id: "grok-4.7", provider: "xai", displayLabel: "Grok 4.7" },
] as const satisfies readonly ModelCatalogEntry[];

export type ModelCatalogId = (typeof MODEL_CATALOG)[number]["id"];

export interface AiModelAssignment {
	assigned: Record<AiPurpose, string>;
	/** Optional fallback per purpose, tried once on a retryable error. */
	fallback: Partial<Record<AiPurpose, string>>;
}

export const DEFAULT_AI_MODEL_ASSIGNMENT: AiModelAssignment = {
	assigned: { avatar_chat: GEMINI_FALLBACK_CATALOG_ID },
	fallback: {},
};

const catalogById = new Map<string, ModelCatalogEntry>(
	MODEL_CATALOG.map((entry) => [entry.id, entry]),
);

export function remapRetiredCatalogId(id: string): string {
	const trimmed = id.trim();
	return RETIRED_CATALOG_IDS[trimmed] ?? trimmed;
}

export function getModelCatalogEntry(
	id: string,
): ModelCatalogEntry | undefined {
	return catalogById.get(id);
}

export function isModelCatalogId(id: string): boolean {
	return catalogById.has(id);
}

export function listModelCatalog(): readonly ModelCatalogEntry[] {
	return MODEL_CATALOG;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Reads the stored assignment JSON, `{ avatar_chat, fallback?: { avatar_chat? } }`.
 * Anything missing or malformed falls back to the default.
 */
export function parseAiModelAssignment(raw: unknown): AiModelAssignment {
	const result: AiModelAssignment = {
		assigned: { ...DEFAULT_AI_MODEL_ASSIGNMENT.assigned },
		fallback: {},
	};
	if (!isRecord(raw)) return result;
	const fallbackRecord = isRecord(raw.fallback) ? raw.fallback : {};
	for (const purpose of AI_PURPOSES) {
		const value = raw[purpose];
		if (typeof value === "string" && value.trim() !== "") {
			result.assigned[purpose] = remapRetiredCatalogId(value);
		}
		const fallback = fallbackRecord[purpose];
		if (typeof fallback === "string" && fallback.trim() !== "") {
			result.fallback[purpose] = remapRetiredCatalogId(fallback);
		}
	}
	return result;
}
