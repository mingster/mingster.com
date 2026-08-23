import { describe, expect, test } from "bun:test";
import { shouldPassThroughBetterAuthProxy } from "@/lib/auth/auth-proxy";
import {
	AUTH_CONTINUE_PATH,
	buildSignInUrl,
	DEFAULT_POST_AUTH_REDIRECT,
	oauthRedirectUrls,
	resolveAuthContinueNext,
	resolveOAuthCallbackUrl,
	wrapOAuthCallbackUrl,
} from "@/lib/auth-sign-in-urls";

describe("resolveOAuthCallbackUrl", () => {
	test("does not land OAuth on `/`", () => {
		expect(resolveOAuthCallbackUrl()).toBe(DEFAULT_POST_AUTH_REDIRECT);
		expect(resolveOAuthCallbackUrl("")).toBe(DEFAULT_POST_AUTH_REDIRECT);
		expect(resolveOAuthCallbackUrl("/")).toBe(DEFAULT_POST_AUTH_REDIRECT);
		expect(resolveOAuthCallbackUrl(" / ")).toBe(DEFAULT_POST_AUTH_REDIRECT);
	});

	test("keeps explicit post-login paths", () => {
		expect(resolveOAuthCallbackUrl("/account")).toBe("/account");
		expect(resolveOAuthCallbackUrl("/blog")).toBe("/blog");
	});
});

describe("wrapOAuthCallbackUrl", () => {
	test("sends OAuth through /auth/continue so gated RSCs are not the first hop", () => {
		expect(wrapOAuthCallbackUrl()).toBe(
			`${AUTH_CONTINUE_PATH}?next=${encodeURIComponent("/account")}`,
		);
		expect(wrapOAuthCallbackUrl("/blog")).toBe(
			`${AUTH_CONTINUE_PATH}?next=${encodeURIComponent("/blog")}`,
		);
	});

	test("does not double-wrap the continue path", () => {
		const once = wrapOAuthCallbackUrl("/account");
		expect(wrapOAuthCallbackUrl(once)).toBe(once);
	});
});

describe("oauthRedirectUrls", () => {
	test("keeps errorCallbackURL on /signIn with the final dest, not continue", () => {
		const urls = oauthRedirectUrls("/account");
		expect(urls.callbackURL.startsWith(AUTH_CONTINUE_PATH)).toBe(true);
		expect(urls.errorCallbackURL).toBe("/signIn?callbackUrl=%2Faccount");
		expect(urls.dest).toBe("/account");
	});
});

describe("resolveAuthContinueNext", () => {
	test("accepts same-origin paths and rejects open redirects", () => {
		expect(resolveAuthContinueNext("/account")).toBe("/account");
		expect(resolveAuthContinueNext("//evil.example")).toBe(
			DEFAULT_POST_AUTH_REDIRECT,
		);
		expect(resolveAuthContinueNext("https://evil.example")).toBe(
			DEFAULT_POST_AUTH_REDIRECT,
		);
		expect(resolveAuthContinueNext("/")).toBe(DEFAULT_POST_AUTH_REDIRECT);
		expect(resolveAuthContinueNext(null)).toBe(DEFAULT_POST_AUTH_REDIRECT);
	});

	test("unwraps a nested continue next param", () => {
		expect(
			resolveAuthContinueNext(
				`${AUTH_CONTINUE_PATH}?next=${encodeURIComponent("/account")}`,
			),
		).toBe("/account");
	});
});

describe("buildSignInUrl", () => {
	test("omits callback query when the target is the homepage", () => {
		expect(buildSignInUrl("/")).toBe("/signIn");
		expect(buildSignInUrl()).toBe("/signIn");
	});
});

describe("shouldPassThroughBetterAuthProxy", () => {
	test("leaves Better Auth callbacks unmodified so Set-Cookie on 302 survives", () => {
		expect(shouldPassThroughBetterAuthProxy("/api/auth/callback/google")).toBe(
			true,
		);
		expect(shouldPassThroughBetterAuthProxy("/api/auth/sign-in/social")).toBe(
			true,
		);
		expect(shouldPassThroughBetterAuthProxy("/api/auth")).toBe(true);
	});

	test("does not skip other API routes", () => {
		expect(shouldPassThroughBetterAuthProxy("/api/chat")).toBe(false);
		expect(shouldPassThroughBetterAuthProxy("/account")).toBe(false);
	});
});
