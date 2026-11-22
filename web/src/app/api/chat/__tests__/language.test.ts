import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildChatSystem } from "../chat-prompt";
import { detectReplyLocale, voiceForLocale } from "../language";

describe("detectReplyLocale", () => {
	test("kana is Japanese, Han is Traditional Chinese, else the UI language", () => {
		expect(detectReplyLocale("こんにちは", "en")).toBe("jp");
		expect(detectReplyLocale("カタカナ and English", "tw")).toBe("jp");
		expect(detectReplyLocale("你好", "en")).toBe("tw");
		expect(detectReplyLocale("hello", "en")).toBe("en");
		expect(detectReplyLocale("12345", "tw")).toBe("tw");
	});

	test("Latin script wins over the UI language (issue 72)", () => {
		expect(detectReplyLocale("which model are u", "tw")).toBe("en");
		expect(detectReplyLocale("hello", "jp")).toBe("en");
	});

	test("unclear script falls back to the UI language", () => {
		expect(detectReplyLocale("👍", "jp")).toBe("jp");
		expect(detectReplyLocale("42 ?!", "tw")).toBe("tw");
	});

	test("the system prompt asks for English when an English message arrives under a tw UI", () => {
		const system = buildChatSystem(
			detectReplyLocale("which model are u", "tw"),
		);
		expect(system).toContain("in English.");
		expect(system).not.toContain("Traditional Chinese");
	});
});

describe("voiceForLocale", () => {
	test("tw and jp use fixed neural voices, en keeps EDGE_TTS_VOICE", () => {
		expect(voiceForLocale("tw")).toBe("zh-TW-HsiaoChenNeural");
		expect(voiceForLocale("jp")).toBe("ja-JP-NanamiNeural");
		const saved = process.env.EDGE_TTS_VOICE;
		process.env.EDGE_TTS_VOICE = "en-GB-SoniaNeural";
		expect(voiceForLocale("en")).toBe("en-GB-SoniaNeural");
		delete process.env.EDGE_TTS_VOICE;
		expect(voiceForLocale("en")).toBe("en-US-JennyNeural");
		if (saved !== undefined) process.env.EDGE_TTS_VOICE = saved;
	});
});

describe("fixed reply copy exists in tw, en and jp", () => {
	const keys = [
		"avatar_chat_intro_1",
		"avatar_chat_intro_2",
		"avatar_chat_reply_sign_in",
		"avatar_chat_reply_paid_only",
		"avatar_chat_reply_not_configured",
		"avatar_chat_reply_failed",
	];
	for (const lng of ["tw", "en", "jp"]) {
		test(lng, () => {
			const file = join(
				process.cwd(),
				`src/app/i18n/locales/${lng}/translation.json`,
			);
			const dict = JSON.parse(readFileSync(file, "utf8")) as Record<
				string,
				string
			>;
			for (const key of keys) {
				expect(typeof dict[key]).toBe("string");
				expect(dict[key].length).toBeGreaterThan(0);
			}
		});
	}
});
