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

/** Same-origin check on one decoding layer: single leading "/", no scheme, no backslash, no control chars. */
function isSafeLayer(path: string): boolean {
	if (!path.startsWith("/") || path.startsWith("//")) {
		return false;
	}
	if (path.includes("://") || path.includes("\\")) {
		return false;
	}
	// Browsers strip tab/CR/LF inside URLs, so "/\t/evil" would become "//evil".
	for (let i = 0; i < path.length; i++) {
		const code = path.charCodeAt(i);
		if (code <= 0x1f || code === 0x7f) {
			return false;
		}
	}
	return true;
}

/**
 * Decode every valid %XX run and leave a stray "%" (such as the one left by
 * "%25") as a literal. Used on layers after the first, where a lone "%" is
 * normal text and must not end the check early.
 */
function decodeLenient(path: string): string {
	return path.replace(/(?:%[0-9a-fA-F]{2})+/g, (run) => {
		try {
			return decodeURIComponent(run);
		} catch {
			return run;
		}
	});
}

/**
 * Same-origin path only (blocks protocol-relative, scheme, backslash and
 * encoded open redirects). Every percent-decoding layer must also pass.
 */
export function isSafeInternalPath(path: string): boolean {
	let current = path;
	for (let depth = 0; depth < 5; depth++) {
		if (!isSafeLayer(current)) {
			return false;
		}
		let decoded: string;
		if (depth === 0) {
			// A malformed first layer is not a path we produced: fail closed.
			try {
				decoded = decodeURIComponent(current);
			} catch {
				return false;
			}
		} else {
			decoded = decodeLenient(current);
		}
		if (decoded === current) {
			return true;
		}
		current = decoded;
	}
	return false;
}

/**
 * Normalize the post-auth destination (not the OAuth `callbackURL`).
 * Empty, `/` and anything that is not a same-origin path become
 * {@link DEFAULT_POST_AUTH_REDIRECT}.
 */
export function resolveOAuthCallbackUrl(callbackUrl?: string | null): string {
	const trimmed = callbackUrl?.trim() ?? "";
	if (!trimmed || trimmed === "/") {
		return DEFAULT_POST_AUTH_REDIRECT;
	}
	if (!isSafeInternalPath(trimmed)) {
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
