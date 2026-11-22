import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { accountLinkingConfig } from "@/lib/auth/account-linking";
import { lineProviderOptions } from "@/lib/auth/line-provider";

/**
 * Integration tests for LINE account linking (issues #69 and #73).
 *
 * They drive the real Better Auth routes (`/sign-up/email`, `/link-social`,
 * `/sign-in/social`, `/callback/line`) through `auth.handler`, with the app's
 * real linking config and LINE provider options. Only LINE's token and
 * profile endpoints are faked, and storage is Better Auth's in-memory adapter.
 */

const BASE = "http://localhost:3002";
const realFetch = globalThis.fetch;

type Row = Record<string, unknown>;
type Db = { user: Row[]; session: Row[]; account: Row[]; verification: Row[] };

let db: Db;
let lineProfile: { sub: string; email: string; name: string };

function makeAuth() {
	db = { user: [], session: [], account: [], verification: [] };
	return betterAuth({
		baseURL: BASE,
		secret: "line-linking-test-secret-0123456789",
		database: memoryAdapter(db),
		emailAndPassword: { enabled: true },
		account: { accountLinking: accountLinkingConfig },
		socialProviders: {
			line: {
				clientId: "line-client",
				clientSecret: "line-secret",
				...lineProviderOptions,
			},
		},
	});
}

/** A tiny browser: keeps cookies between requests. */
class Browser {
	private jar = new Map<string, string>();
	constructor(private auth: ReturnType<typeof makeAuth>) {}

	async request(path: string, init: RequestInit = {}) {
		const headers = new Headers(init.headers);
		headers.set("origin", BASE);
		if (init.body) headers.set("content-type", "application/json");
		if (this.jar.size > 0) {
			headers.set(
				"cookie",
				[...this.jar].map(([k, v]) => `${k}=${v}`).join("; "),
			);
		}
		const res = await this.auth.handler(
			new Request(`${BASE}/api/auth${path}`, { ...init, headers }),
		);
		for (const line of res.headers.getSetCookie()) {
			const [pair] = line.split(";");
			const i = pair.indexOf("=");
			const name = pair.slice(0, i).trim();
			const value = pair.slice(i + 1).trim();
			if (value === "" || /max-age=0/i.test(line)) this.jar.delete(name);
			else this.jar.set(name, value);
		}
		return res;
	}

	post(path: string, body: unknown) {
		return this.request(path, { method: "POST", body: JSON.stringify(body) });
	}

	async signUp(email: string) {
		const res = await this.post("/sign-up/email", {
			email,
			password: "password-12345",
			name: email.split("@")[0],
		});
		expect(res.status).toBe(200);
		return ((await res.json()) as { user: { id: string } }).user.id;
	}

	/** Start a LINE flow (link when `link`, otherwise sign-in) and return the state. */
	async startLine(link: boolean, extra: Record<string, unknown> = {}) {
		const res = await this.post(link ? "/link-social" : "/sign-in/social", {
			provider: "line",
			callbackURL: "/account",
			errorCallbackURL: "/error-page",
			disableRedirect: true,
			...extra,
		});
		expect(res.status).toBe(200);
		const { url } = (await res.json()) as { url: string };
		const state = new URL(url).searchParams.get("state");
		expect(state).toBeTruthy();
		return state as string;
	}

	/** Complete the LINE redirect. LINE returns whatever `lineProfile` holds. */
	async callback(state: string) {
		const res = await this.request(`/callback/line?code=abc&state=${state}`);
		expect(res.status).toBe(302);
		return res.headers.get("location") ?? "";
	}
}

function lineAccounts() {
	return db.account.filter((a) => a.providerId === "line");
}

async function verifyEmail(auth: ReturnType<typeof makeAuth>, id: string) {
	const ctx = await auth.$context;
	await ctx.internalAdapter.updateUser(id, { emailVerified: true });
}

beforeEach(() => {
	lineProfile = { sub: "U-line-1", email: "x@example.com", name: "Line User" };
	globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = typeof input === "string" ? input : input.toString();
		if (url.startsWith("https://api.line.me/oauth2/v2.1/token")) {
			return Response.json({
				access_token: "line-access",
				token_type: "Bearer",
				expires_in: 3600,
				refresh_token: "line-refresh",
				scope: "openid profile email",
			});
		}
		if (url.startsWith("https://api.line.me/oauth2/v2.1/userinfo")) {
			return Response.json(lineProfile);
		}
		if (url.startsWith(BASE)) return realFetch(input, init);
		throw new Error(`unexpected fetch in test: ${url}`);
	}) as typeof fetch;
});

afterEach(() => {
	globalThis.fetch = realFetch;
});

describe("LINE linking through the real callback route", () => {
	test("a signed-in user can link LINE to their own account", async () => {
		const auth = makeAuth();
		const me = new Browser(auth);
		const userId = await me.signUp("me@example.com");
		lineProfile = { sub: "U-me", email: "me-line@example.com", name: "Me" };

		const state = await me.startLine(true);
		const location = await me.callback(state);

		expect(location).not.toContain("error");
		expect(lineAccounts()).toHaveLength(1);
		expect(lineAccounts()[0]).toMatchObject({
			accountId: "U-me",
			userId,
		});
	});

	test("a signed-out LINE sign-in with another user's email does not link", async () => {
		const auth = makeAuth();
		const owner = new Browser(auth);
		const ownerId = await owner.signUp("owner@example.com");
		await verifyEmail(auth, ownerId);
		lineProfile = { sub: "U-evil", email: "owner@example.com", name: "Evil" };

		const stranger = new Browser(auth);
		const state = await stranger.startLine(false);
		const location = await stranger.callback(state);

		expect(location).toContain("account_not_linked");
		expect(lineAccounts()).toHaveLength(0);
	});

	test("a signed-in attacker cannot link a LINE identity to someone else's account", async () => {
		const auth = makeAuth();
		const owner = new Browser(auth);
		const ownerId = await owner.signUp("owner@example.com");
		await verifyEmail(auth, ownerId);
		const attacker = new Browser(auth);
		const attackerId = await attacker.signUp("attacker@example.com");

		// 1. Attacker, already signed in, does a plain LINE sign-in with the
		//    owner's email. This is not a link flow, so it must be refused.
		lineProfile = { sub: "U-evil", email: "owner@example.com", name: "Evil" };
		let state = await attacker.startLine(false);
		let location = await attacker.callback(state);
		expect(location).toContain("account_not_linked");
		expect(lineAccounts()).toHaveLength(0);

		// 2. Attacker forges link data in additionalData on both entry points.
		const forged = {
			link: { userId: ownerId, email: "owner@example.com" },
		};
		state = await attacker.startLine(false, { additionalData: forged });
		location = await attacker.callback(state);
		expect(location).toContain("account_not_linked");
		expect(lineAccounts()).toHaveLength(0);

		state = await attacker.startLine(true, { additionalData: forged });
		location = await attacker.callback(state);
		expect(location).not.toContain("error");
		expect(lineAccounts()).toHaveLength(1);
		expect(lineAccounts()[0]?.userId).toBe(attackerId);
		expect(db.account.some((a) => a.userId === ownerId)).toBe(true);
		expect(
			db.account.some((a) => a.userId === ownerId && a.providerId === "line"),
		).toBe(false);
	});

	test("a LINE identity already linked to the owner cannot be moved by another signed-in user", async () => {
		const auth = makeAuth();
		const owner = new Browser(auth);
		const ownerId = await owner.signUp("owner@example.com");
		lineProfile = { sub: "U-owner", email: "owner@example.com", name: "Owner" };
		await owner.callback(await owner.startLine(true));
		expect(lineAccounts()).toHaveLength(1);

		const attacker = new Browser(auth);
		await attacker.signUp("attacker@example.com");
		const location = await attacker.callback(await attacker.startLine(true));

		expect(location).toContain("error");
		expect(lineAccounts()).toHaveLength(1);
		expect(lineAccounts()[0]?.userId).toBe(ownerId);
	});

	test("a link started in one browser cannot be finished in another", async () => {
		const auth = makeAuth();
		const me = new Browser(auth);
		await me.signUp("me@example.com");
		const state = await me.startLine(true);

		// The victim's browser has no matching state cookie.
		const victim = new Browser(auth);
		const location = await victim.callback(state);

		expect(location).toContain("error");
		expect(lineAccounts()).toHaveLength(0);
	});

	test("a link is refused once the session that started it is gone", async () => {
		const auth = makeAuth();
		const me = new Browser(auth);
		await me.signUp("me@example.com");
		const state = await me.startLine(true);
		db.session.length = 0;

		const location = await me.callback(state);

		expect(location).toContain("error");
		expect(lineAccounts()).toHaveLength(0);
	});

	test("a first-time LINE user with a new email still signs up", async () => {
		const auth = makeAuth();
		const fresh = new Browser(auth);
		lineProfile = { sub: "U-new", email: "new@example.com", name: "New" };

		const location = await fresh.callback(await fresh.startLine(false));

		expect(location).not.toContain("error");
		expect(lineAccounts()).toHaveLength(1);
		expect(db.user.some((u) => u.email === "new@example.com")).toBe(true);
	});
});
