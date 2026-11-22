import { describe, expect, test } from "bun:test";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import { accountLinkingConfig } from "@/lib/auth/account-linking";

const EMAIL = "owner@example.com";

const existingUser = {
	id: "user-1",
	email: EMAIL,
	emailVerified: true,
	name: "Owner",
};

function makeCtx() {
	const linked: unknown[] = [];
	const ctx = {
		context: {
			options: { account: { accountLinking: accountLinkingConfig } },
			trustedProviders: accountLinkingConfig.trustedProviders,
			socialProviders: [],
			logger: { error() {}, warn() {}, info() {}, debug() {} },
			internalAdapter: {
				findAccountOwnerByKey: async () => null,
				findUserByEmail: async () => ({ user: existingUser, accounts: [] }),
				updateUser: async () => existingUser,
				createSession: async () => ({ id: "s1", userId: existingUser.id }),
				linkAccount: async (a: Record<string, unknown>) => {
					linked.push(a);
					return { id: "acc-1", ...a };
				},
			},
		},
	};
	return { ctx, linked };
}

async function signIn(providerId: string, emailVerified: boolean) {
	const { ctx, linked } = makeCtx();
	const result = await handleOAuthUserInfo(
		ctx as never,
		{
			userInfo: {
				id: `${providerId}-sub`,
				email: EMAIL,
				name: "Someone",
				emailVerified,
			},
			account: { providerId, accountId: `${providerId}-sub` },
			callbackURL: "/",
		} as never,
	);
	return { result, linked };
}

// Better Auth hardcodes emailVerified: false for LINE profiles, and LINE's
// docs do not say the email claim is verified (issue #69).
describe("account linking on OAuth sign-in (issue #69)", () => {
	test("LINE with an unverified email does not link to the existing account", async () => {
		const { result, linked } = await signIn("line", false);
		expect(result.error).toBe("account not linked");
		expect(result.data).toBeNull();
		expect(linked).toHaveLength(0);
	});

	test("LINE is not a trusted linking provider", () => {
		expect(accountLinkingConfig.trustedProviders).not.toContain("line");
	});

	test("Google still links to the existing account", async () => {
		const { result, linked } = await signIn("google", false);
		expect(result.error).toBeNull();
		expect(linked).toHaveLength(1);
	});

	test("Apple still links to the existing account", async () => {
		const { result, linked } = await signIn("apple", false);
		expect(result.error).toBeNull();
		expect(linked).toHaveLength(1);
	});
});
