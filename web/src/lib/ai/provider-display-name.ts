import type { AiProvider } from "./providers";

const AI_PROVIDER_DISPLAY_NAMES: Record<AiProvider, string> = {
	gemini: "Gemini",
	anthropic: "Claude",
	xai: "Grok",
};

export function getAiProviderDisplayName(provider: AiProvider): string {
	return AI_PROVIDER_DISPLAY_NAMES[provider];
}
