/** Model vendors in the catalog. Only the ones in WIRED_AI_PROVIDERS have an adapter. */
export const AI_PROVIDERS = ["gemini", "anthropic", "xai"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

/** Providers with a working adapter in generate-content.ts. Grok joins in its own ticket. */
export const WIRED_AI_PROVIDERS: readonly AiProvider[] = [
	"gemini",
	"anthropic",
];

/** Why a model is called. The sysAdmin page assigns a model per purpose. */
export const AI_PURPOSES = ["avatar_chat"] as const;
export type AiPurpose = (typeof AI_PURPOSES)[number];
