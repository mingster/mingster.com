import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let session: unknown = null;
let subscriptionStatus: string | null = null;
mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: async () => session } },
}));
mock.module("next/headers", () => ({ headers: async () => new Headers() }));
mock.module("@/lib/prismadb", () => ({
	sqlClient: {
		subscription: {
			// Mirrors the query: only active and trialing rows match.
			findFirst: async ({ where }: { where: { status: { in: string[] } } }) =>
				subscriptionStatus && where.status.in.includes(subscriptionStatus)
					? { id: "sub1" }
					: null,
		},
	},
}));

const { getChatAccess } = await import("../get-chat-access");

const saved = process.env.ADMINS;
beforeEach(() => {
	process.env.ADMINS = "owner@example.com";
	session = null;
	subscriptionStatus = null;
});
afterEach(() => {
	if (saved === undefined) delete process.env.ADMINS;
	else process.env.ADMINS = saved;
});

const signedIn = (extra: Record<string, unknown> = {}) => ({
	user: { id: "u1", email: "u@example.com", ...extra },
});

describe("getChatAccess (case 25)", () => {
	test("signed out gives sign_in", async () => {
		expect(await getChatAccess()).toEqual({ access: "sign_in" });
	});

	test("anonymous gives paid_only, even with a subscription row", async () => {
		session = signedIn({ isAnonymous: true });
		subscriptionStatus = "active";
		expect((await getChatAccess()).access).toBe("paid_only");
	});

	test("unpaid, canceled and past_due give paid_only", async () => {
		session = signedIn();
		for (const status of [null, "canceled", "past_due"]) {
			subscriptionStatus = status;
			expect(await getChatAccess()).toEqual({
				access: "paid_only",
				userId: "u1",
			});
		}
	});

	test("active and trialing give ok", async () => {
		session = signedIn();
		for (const status of ["active", "trialing"]) {
			subscriptionStatus = status;
			expect(await getChatAccess()).toEqual({ access: "ok", userId: "u1" });
		}
	});

	test("admin gives ok with no subscription", async () => {
		session = signedIn({ email: "owner@example.com", emailVerified: true });
		expect((await getChatAccess()).access).toBe("ok");
		session = signedIn({ role: "admin" });
		expect((await getChatAccess()).access).toBe("ok");
	});

	test("an unverified ADMINS email is not the owner", async () => {
		session = signedIn({ email: "owner@example.com", emailVerified: false });
		expect((await getChatAccess()).access).toBe("paid_only");
	});
});
