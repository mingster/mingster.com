import { checkAdminAccess } from "@/lib/admin/access";
import { loadAiModelAssignment } from "./load-ai-model-assignment";
import { getModelCatalogEntry, listModelCatalog } from "./model-catalog";
import { getAiProviderDisplayName } from "./provider-display-name";
import { hasUsableProviderKey } from "./provider-env-keys";
import { AI_PROVIDERS, type AiProvider } from "./providers";

export interface AiModelsPageData {
	/** Current assignment for avatar_chat. */
	model: string;
	fallback: string | null;
	/** One flag per provider. Never a key value. */
	providerConfigured: Record<AiProvider, boolean>;
	providerNames: Record<AiProvider, string>;
	catalog: { id: string; provider: AiProvider; label: string }[];
	/** The assigned model is unknown or its provider is unusable, so chat runs on Gemini. */
	misconfigured: boolean;
}

/**
 * Returns null for anyone who is not an admin, before it reads the settings
 * row or the key status. The layout check alone does not stop the page from
 * running, so every sysAdmin loader calls this itself.
 */
export async function loadAiModelsPageData(): Promise<AiModelsPageData | null> {
	if (!(await checkAdminAccess())) return null;

	const assignment = await loadAiModelAssignment();
	const model = assignment.assigned.avatar_chat;
	const providerConfigured = Object.fromEntries(
		AI_PROVIDERS.map((p) => [p, hasUsableProviderKey(p)]),
	) as Record<AiProvider, boolean>;
	const providerNames = Object.fromEntries(
		AI_PROVIDERS.map((p) => [p, getAiProviderDisplayName(p)]),
	) as Record<AiProvider, string>;
	const assigned = getModelCatalogEntry(model);
	return {
		model,
		fallback: assignment.fallback.avatar_chat ?? null,
		providerConfigured,
		providerNames,
		catalog: listModelCatalog().map((e) => ({
			id: e.id,
			provider: e.provider,
			label: e.displayLabel,
		})),
		misconfigured: !assigned || !providerConfigured[assigned.provider],
	};
}
