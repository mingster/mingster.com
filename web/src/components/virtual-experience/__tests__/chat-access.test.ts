import { describe, expect, test } from "bun:test";
import { fetchChatAccess, getChatAccessView } from "../chat-access";

const json = (body: unknown, status = 200) =>
	(async () =>
		new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe("getChatAccessView", () => {
	test("case 3: paid or owner sees no notice and the input is on", () => {
		expect(getChatAccessView("ok")).toEqual({
			notice: null,
			showSignInButton: false,
			showInput: true,
		});
	});

	test("unpaid sees the paid only notice with no button", () => {
		const v = getChatAccessView("paid_only");
		expect(v.notice).toBe("avatar_chat_paid_only");
		expect(v.showSignInButton).toBe(false);
		expect(v.showInput).toBe(true);
	});

	test("signed out sees the prompt and the sign in button", () => {
		const v = getChatAccessView("sign_in");
		expect(v.notice).toBe("avatar_chat_sign_in_prompt");
		expect(v.showSignInButton).toBe(true);
		expect(v.showInput).toBe(false);
	});

	test("failed check shows the access error and no input", () => {
		const v = getChatAccessView("error");
		expect(v.notice).toBe("avatar_chat_access_error");
		expect(v.showInput).toBe(false);
	});

	test("loading shows the loading text and no input", () => {
		const v = getChatAccessView("loading");
		expect(v.notice).toBe("avatar_chat_loading");
		expect(v.showInput).toBe(false);
	});
});

describe("fetchChatAccess", () => {
	for (const access of ["ok", "sign_in", "paid_only"] as const) {
		test(`returns ${access}`, async () => {
			expect(await fetchChatAccess(json({ access }))).toBe(access);
		});
	}

	test("rejects on a 500", async () => {
		await expect(
			fetchChatAccess(json({ error: "access_check_failed" }, 500)),
		).rejects.toThrow();
	});

	test("rejects on an unknown value", async () => {
		await expect(fetchChatAccess(json({ access: "vip" }))).rejects.toThrow();
	});

	test("rejects when the network fails", async () => {
		const failing = (async () => {
			throw new TypeError("network");
		}) as unknown as typeof fetch;
		await expect(fetchChatAccess(failing)).rejects.toThrow();
	});
});
