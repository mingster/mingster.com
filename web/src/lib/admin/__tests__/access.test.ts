import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// Only the session is faked. checkAdminAccess itself runs for real.
let session: unknown = null;
mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: async () => session } },
}));
mock.module("next/headers", () => ({ headers: async () => new Headers() }));

const { checkAdminAccess } = await import("../access");

const saved = process.env.ADMINS;
beforeEach(() => {
	process.env.ADMINS = "owner@example.com, Other@Example.com";
	session = null;
});
afterEach(() => {
	if (saved === undefined) delete process.env.ADMINS;
	else process.env.ADMINS = saved;
});

const user = (extra: Record<string, unknown>) => ({
	user: { id: "u1", ...extra },
});

describe("checkAdminAccess (case 30)", () => {
	test("signed out is rejected", async () => {
		expect(await checkAdminAccess()).toBe(false);
	});

	test("allowlisted email with emailVerified false is rejected", async () => {
		session = user({ email: "owner@example.com", emailVerified: false });
		expect(await checkAdminAccess()).toBe(false);
	});

	test("allowlisted email with emailVerified missing is rejected", async () => {
		session = user({ email: "owner@example.com" });
		expect(await checkAdminAccess()).toBe(false);
	});

	test("allowlisted email with emailVerified true is accepted, case insensitive", async () => {
		session = user({ email: "OWNER@example.com", emailVerified: true });
		expect(await checkAdminAccess()).toBe(true);
	});

	test("a verified email outside ADMINS is rejected", async () => {
		session = user({ email: "someone@example.com", emailVerified: true });
		expect(await checkAdminAccess()).toBe(false);
	});

	test("the admin role is still accepted", async () => {
		session = user({ email: "x@example.com", role: "admin" });
		expect(await checkAdminAccess()).toBe(true);
	});
});
