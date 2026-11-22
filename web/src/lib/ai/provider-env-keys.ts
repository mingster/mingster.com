import { type AiProvider, WIRED_AI_PROVIDERS } from "./providers";

/** Env names per provider, tried in order. Values are server only and never logged. */
const PROVIDER_ENV_KEYS: Record<AiProvider, readonly string[]> = {
	gemini: ["GOOGLE_GENERATIVE_AI_API_KEY", "GEMINI_API_KEY"],
	anthropic: ["ANTHROPIC_API_KEY"],
	xai: ["XAI_API_KEY"],
};

export function getProviderApiKey(provider: AiProvider): string | undefined {
	for (const name of PROVIDER_ENV_KEYS[provider]) {
		const value = process.env[name];
		if (typeof value === "string" && value.trim() !== "") {
			return value.trim();
		}
	}
	return undefined;
}

export function hasProviderEnvKey(provider: AiProvider): boolean {
	return getProviderApiKey(provider) !== undefined;
}

/** Usable means a key and an adapter. One predicate for chat and the sysAdmin page. */
export function hasUsableProviderKey(provider: AiProvider): boolean {
	return WIRED_AI_PROVIDERS.includes(provider) && hasProviderEnvKey(provider);
}
