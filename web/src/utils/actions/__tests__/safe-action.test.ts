import { beforeEach, describe, expect, mock, test } from "bun:test";

let session: { user: { id: string; email: string; role?: string } } | null =
	null;

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

describe("adminActionClient", () => {
	beforeEach(() => {
		session = null;
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
});
