import type { ChatUiLanguage } from "./request-schema";

export type ChatLocale = ChatUiLanguage;

const KANA_RE = /[぀-ヿ]/;
const HAN_RE = /[一-鿿]/;
const LATIN_RE = /[A-Za-z]/;

/** Language used when a request carries no `uiLanguage` (the site's fallbackLng). */
export const DEFAULT_CHAT_LOCALE: ChatLocale = "tw";

/**
 * Reply language: the script of the message wins over the UI language
 * (kana is Japanese, Han is Traditional Chinese, Latin letters are English,
 * anything else such as emoji or digits keeps the UI language). Same rule as riben's detect-line-assistant-locale.
 */
export function detectReplyLocale(
	message: string,
	uiLanguage: ChatLocale,
): ChatLocale {
	if (KANA_RE.test(message)) return "jp";
	if (HAN_RE.test(message)) return "tw";
	if (LATIN_RE.test(message)) return "en";
	return uiLanguage;
}

/** Language names for the model instructions. */
export const REPLY_LANGUAGE_NAME: Record<ChatLocale, string> = {
	tw: "Traditional Chinese (Taiwan)",
	en: "English",
	jp: "Japanese",
};

/** Edge TTS voice per reply language. English keeps EDGE_TTS_VOICE. */
export function voiceForLocale(locale: ChatLocale): string {
	switch (locale) {
		case "tw":
			return "zh-TW-HsiaoChenNeural";
		case "jp":
			return "ja-JP-NanamiNeural";
		default:
			return process.env.EDGE_TTS_VOICE ?? "en-US-JennyNeural";
	}
}
