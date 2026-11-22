import { getOAuthState } from "better-auth/api";

/**
 * LINE profiles are always `emailVerified: false` in Better Auth, and LINE is
 * not a trusted linking provider (issue #69). Better Auth refuses an explicit
 * link for an untrusted provider with an unverified email, so signed-in users
 * could not link LINE (issue #73).
 *
 * This marks the email as verified only while completing a link that a
 * signed-in user started. Such a callback carries `link` in the stored OAuth
 * state. Only `/link-social` writes it, from the session's own user, and the
 * callback then attaches the account to `link.userId` and nobody else, after
 * checking that the starting session is still live. A sign-in callback has no
 * `link`, so it keeps `emailVerified: false` and cannot link by email match.
 */
export async function lineMapProfileToUser() {
	const state = await getOAuthState();
	return state?.link ? { emailVerified: true } : {};
}

/**
 * Options for the LINE social provider shared by the app and the integration
 * test (client id and secret are added where the provider is built).
 */
export const lineProviderOptions = {
	scope: ["openid", "profile", "email"],
	overrideUserInfoOnSignIn: true,
	mapProfileToUser: lineMapProfileToUser,
};
