import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

let session: {
	user: {
		id: string;
		email: string;
		role?: string;
		emailVerified?: boolean;
		isAnonymous?: boolean;
	};
} | null = null;

mock.module("next/headers", () => ({
	headers: async () => new Headers(),
}));
mock.module("@/lib/auth", () => ({
	auth: { api: { getSession: async () => session } },
}));
mock.module("@/lib/prismadb", () => ({ sqlClient: {} }));
mock.module("@/lib/logger", () => ({
	default: { info() {}, error() {}, warn() {}, debug() {} },
}));

const { adminActionClient } = await import("@/utils/actions/safe-action");

const adminOnlyAction = adminActionClient
	.metadata({ name: "adminOnlyTest" })
	.action(async () => "ran");

const savedAdmins = process.env.ADMINS;

describe("adminActionClient", () => {
	beforeEach(() => {
		process.env.ADMINS = "owner@example.com";
		session = null;
	});
	afterEach(() => {
		if (savedAdmins === undefined) delete process.env.ADMINS;
		else process.env.ADMINS = savedAdmins;
	});

	test("rejects a signed-out caller", async () => {
		const result = await adminOnlyAction();
		expect(result?.data).toBeUndefined();
		expect(result?.serverError).toBeDefined();
	});

	test("rejects a signed-in non-admin", async () => {
		session = { user: { id: "u1", email: "user@example.com", role: "user" } };
		const result = await adminOnlyAction();
		expect(result?.data).toBeUndefined();
		expect(result?.serverError).toBeDefined();
	});

	test("allows an admin", async () => {
		session = { user: { id: "a1", email: "admin@example.com", role: "admin" } };
		const result = await adminOnlyAction();
		expect(result?.data).toBe("ran");
		expect(result?.serverError).toBeUndefined();
	});

	test("rejects an anonymous session", async () => {
		session = {
			user: { id: "n1", email: "temp@example.com", isAnonymous: true },
		};
		const result = await adminOnlyAction();
		expect(result?.data).toBeUndefined();
		expect(result?.serverError).toBeDefined();
	});

	test("rejects an allowlisted email that is not verified", async () => {
		session = {
			user: {
				id: "u2",
				email: "owner@example.com",
				role: "user",
				emailVerified: false,
			},
		};
		const result = await adminOnlyAction();
		expect(result?.data).toBeUndefined();
		expect(result?.serverError).toBeDefined();
	});

	test("allows a verified allowlisted email", async () => {
		session = {
			user: {
				id: "u3",
				email: "Owner@Example.com",
				role: "user",
				emailVerified: true,
			},
		};
		const result = await adminOnlyAction();
		expect(result?.data).toBe("ran");
		expect(result?.serverError).toBeUndefined();
	});
});
