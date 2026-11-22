import {
	type AiModelAssignment,
	DEFAULT_AI_MODEL_ASSIGNMENT,
	GEMINI_FALLBACK_CATALOG_ID,
	getModelCatalogEntry,
	type ModelCatalogEntry,
} from "./model-catalog";
import type { AiProvider, AiPurpose } from "./providers";

export interface ResolveAiModelInput {
	purpose: AiPurpose;
	/** Parsed assignment; null or undefined uses the default. */
	assignment?: AiModelAssignment | null;
	hasProviderKey: (provider: AiProvider) => boolean;
}

export interface ResolveAiModelResult {
	entry: ModelCatalogEntry;
	/** A different provider, tried once on a retryable error. Only set when configured. */
	fallbackEntry?: ModelCatalogEntry;
	/** True when the assigned model could not be used and Gemini Flash runs instead. */
	usedFallback: boolean;
	/** The assigned catalog entry that was skipped because its provider has no key or adapter. */
	unusableAssigned?: ModelCatalogEntry;
}

function geminiFallbackEntry(): ModelCatalogEntry {
	const entry = getModelCatalogEntry(GEMINI_FALLBACK_CATALOG_ID);
	if (!entry) {
		throw new Error(
			`Model catalog missing Gemini fallback id ${GEMINI_FALLBACK_CATALOG_ID}`,
		);
	}
	return entry;
}

/**
 * Picks the catalog entry for a purpose. An unknown id or an assigned provider
 * without a key runs on Gemini Flash.
 */
export function resolveAiModelForPurpose(
	input: ResolveAiModelInput,
): ResolveAiModelResult {
	const assignment = input.assignment ?? DEFAULT_AI_MODEL_ASSIGNMENT;
	const entry = getModelCatalogEntry(assignment.assigned[input.purpose]);
	if (!entry || !input.hasProviderKey(entry.provider)) {
		return {
			entry: geminiFallbackEntry(),
			usedFallback: true,
			unusableAssigned: entry,
		};
	}
	const configured = assignment.fallback[input.purpose];
	const candidate = configured ? getModelCatalogEntry(configured) : undefined;
	const fallbackEntry =
		candidate &&
		candidate.provider !== entry.provider &&
		input.hasProviderKey(candidate.provider)
			? candidate
			: undefined;
	return { entry, fallbackEntry, usedFallback: false };
}
