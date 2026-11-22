import { describe, expect, test } from "bun:test";
import { CHAT_UI_COPY_KEYS } from "@/components/virtual-experience/chat-access";
import en from "../locales/en/translation.json";
import jp from "../locales/jp/translation.json";
import tw from "../locales/tw/translation.json";

const locales = { tw, en, jp } as Record<string, Record<string, string>>;

// Spoken replies and intro lines were added by the route work (#43); same rule applies.
const ALL_CHAT_KEYS = [
	...CHAT_UI_COPY_KEYS,
	"avatar_chat_intro_1",
	"avatar_chat_intro_2",
	"avatar_chat_reply_sign_in",
	"avatar_chat_reply_paid_only",
	"avatar_chat_reply_not_configured",
	"avatar_chat_reply_failed",
];

describe("avatar chat copy (case 20)", () => {
	for (const [lng, dict] of Object.entries(locales)) {
		test(`every chat key exists and is non empty in ${lng}`, () => {
			for (const key of ALL_CHAT_KEYS) {
				expect(typeof dict[key], `${lng}:${key}`).toBe("string");
				expect(dict[key].trim().length, `${lng}:${key}`).toBeGreaterThan(0);
			}
		});
	}

	test("every avatar_chat_ key in tw also exists in en and jp", () => {
		for (const key of Object.keys(tw).filter((k) =>
			k.startsWith("avatar_chat_"),
		)) {
			expect(key in en, `en:${key}`).toBe(true);
			expect(key in jp, `jp:${key}`).toBe(true);
		}
	});

	test("jp copy is Japanese, not a copy of the Chinese fallback", () => {
		for (const key of CHAT_UI_COPY_KEYS) {
			if (key === "avatar_chat_sign_in_button") continue; // 登入 vs ログイン still differ
			expect(jp[key as keyof typeof jp]).not.toBe(tw[key as keyof typeof tw]);
		}
		expect(jp.avatar_chat_sign_in_button).toBe("ログイン");
	});
});
