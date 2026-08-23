/**
 * Better Auth 1.7 keys Account rows by (issuer, accountId).
 * Map legacy `providerId` values to the issuers the installed plugins write.
 *
 * @see https://www.better-auth.com/docs/guides/1-7-upgrade-guide
 */
const TRUSTED_SOCIAL_ISSUERS: Record<string, string> = {
	google: "https://accounts.google.com",
	apple: "https://appleid.apple.com",
	line: "https://access.line.me",
};

export function createLocalAccountIssuer(providerId: string): string {
	return `local:${encodeURIComponent(providerId)}`;
}

export function createOAuthAccountIssuer(providerId: string): string {
	return `local:oauth:${encodeURIComponent(providerId)}`;
}

/**
 * Issuer to persist on an existing Account that was created before the column existed.
 * Credential/phone rows use `local:credential`; Google/Apple/LINE use their OIDC issuer.
 */
export function issuerForLegacyProviderId(providerId: string): string {
	const trusted = TRUSTED_SOCIAL_ISSUERS[providerId];
	if (trusted) {
		return trusted;
	}
	if (providerId === "credential" || providerId === "phone") {
		return createLocalAccountIssuer("credential");
	}
	return createOAuthAccountIssuer(providerId);
}
