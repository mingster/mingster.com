/** App sign-in route (see `app/(root)/signIn/page.tsx`). */
export const SIGN_IN_PATH = "/signIn";

/**
 * Client hop after OAuth/magic-link. The session cookie is set on the callback
 * 302; browsers often omit that newly-set SameSite=Lax cookie on the next
 * request in the cross-site redirect chain, so a session-gated RSC like
 * `/account` bounces to `/signIn`. This page waits for a same-origin
 * `get-session` (cookie is in the jar by then) then navigates to `next`.
 */
export const AUTH_CONTINUE_PATH = "/auth/continue";

/**
 * Default after OAuth/passwordless. Do not use `/` as Better Auth `callbackURL`
 * without wrapping — gated RSCs in the OAuth redirect chain miss the new cookie.
 *
 * Do not send Better Auth `callbackURL` here directly — wrap with
 * {@link wrapOAuthCallbackUrl} so the first request is not a gated RSC.
 */
export const DEFAULT_POST_AUTH_REDIRECT = "/account";

/** Same-origin path only (blocks protocol-relative and open redirects). */
export function isSafeInternalPath(path: string): boolean {
	if (!path.startsWith("/") || path.startsWith("//")) {
		return false;
	}
	if (path.includes("://") || path.includes("\\")) {
		return false;
	}
	return true;
}

/**
 * Normalize the post-auth destination (not the OAuth `callbackURL`).
 * Empty and `/` become {@link DEFAULT_POST_AUTH_REDIRECT}.
 */
export function resolveOAuthCallbackUrl(callbackUrl?: string | null): string {
	const trimmed = callbackUrl?.trim() ?? "";
	if (!trimmed || trimmed === "/") {
		return DEFAULT_POST_AUTH_REDIRECT;
	}
	return trimmed;
}

/**
 * Better Auth `callbackURL` after social/magic-link. Lands on the client
 * continue page so `/account` (and other gated RSCs) are not the first
 * request in the OAuth redirect chain.
 */
export function wrapOAuthCallbackUrl(callbackUrl?: string | null): string {
	const next = resolveOAuthCallbackUrl(callbackUrl);
	if (
		next === AUTH_CONTINUE_PATH ||
		next.startsWith(`${AUTH_CONTINUE_PATH}?`)
	) {
		return next;
	}
	return `${AUTH_CONTINUE_PATH}?next=${encodeURIComponent(next)}`;
}

/** `callbackURL` + `errorCallbackURL` for social sign-in. */
export function oauthRedirectUrls(callbackUrl?: string | null): {
	callbackURL: string;
	errorCallbackURL: string;
	dest: string;
} {
	const dest = resolveOAuthCallbackUrl(callbackUrl);
	return {
		dest,
		callbackURL: wrapOAuthCallbackUrl(dest),
		errorCallbackURL: buildSignInErrorCallbackUrl(dest),
	};
}

/**
 * Read `?next=` on {@link AUTH_CONTINUE_PATH}. Unsafe values fall back to
 * {@link DEFAULT_POST_AUTH_REDIRECT}.
 */
export function resolveAuthContinueNext(
	raw: string | null | undefined,
): string {
	const trimmed = raw?.trim() ?? "";
	if (!trimmed) {
		return DEFAULT_POST_AUTH_REDIRECT;
	}

	let decoded = trimmed;
	try {
		decoded = decodeURIComponent(trimmed);
	} catch {
		return DEFAULT_POST_AUTH_REDIRECT;
	}

	if (!isSafeInternalPath(decoded)) {
		return DEFAULT_POST_AUTH_REDIRECT;
	}

	if (
		decoded === AUTH_CONTINUE_PATH ||
		decoded.startsWith(`${AUTH_CONTINUE_PATH}?`)
	) {
		try {
			const inner = new URL(
				decoded,
				"http://mingster.invalid",
			).searchParams.get("next");
			if (inner && inner !== decoded) {
				return resolveAuthContinueNext(inner);
			}
		} catch {
			return DEFAULT_POST_AUTH_REDIRECT;
		}
		return DEFAULT_POST_AUTH_REDIRECT;
	}

	if (decoded === "/") {
		return DEFAULT_POST_AUTH_REDIRECT;
	}

	return decoded;
}

/** Build sign-in URL, preserving post-login redirect when provided. */
export function buildSignInUrl(callbackUrl?: string): string {
	if (!callbackUrl || callbackUrl === "/") {
		return SIGN_IN_PATH;
	}
	return `${SIGN_IN_PATH}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/** OAuth error redirect target (e.g. user cancels Google consent). */
export function buildSignInErrorCallbackUrl(callbackUrl?: string): string {
	return buildSignInUrl(callbackUrl);
}
