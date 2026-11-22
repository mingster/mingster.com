import { getT } from "@/app/i18n";
import logger from "@/lib/logger";
import type { ChatMessage } from "@/types/virtual-experience";
import type { ChatLocale } from "./language";
import { type SpokenPart, speakPart } from "./speak";

/** Spoken lines that never change: intro, access and failure replies. */
export const FIXED_REPLIES = {
	avatar_chat_intro_1: { facialExpression: "happy", animation: "Talking" },
	avatar_chat_intro_2: { facialExpression: "neutral", animation: "Idle" },
	avatar_chat_reply_sign_in: {
		facialExpression: "neutral",
		animation: "Talking",
	},
	avatar_chat_reply_paid_only: {
		facialExpression: "neutral",
		animation: "Talking",
	},
	avatar_chat_reply_not_configured: {
		facialExpression: "sad",
		animation: "Idle",
	},
	avatar_chat_reply_failed: { facialExpression: "sad", animation: "Idle" },
} as const;

export type FixedReplyKey = keyof typeof FIXED_REPLIES;

/** One build per (key, language), kept in memory. The promise is shared by concurrent requests. */
const cache = new Map<string, Promise<SpokenPart>>();

export function clearFixedReplyCache(): void {
	cache.clear();
}

async function buildFixedReply(
	key: FixedReplyKey,
	locale: ChatLocale,
	noAudio: boolean,
): Promise<SpokenPart> {
	const { t } = await getT(locale);
	return speakPart({ text: t(key), ...FIXED_REPLIES[key] }, locale, {
		noAudio,
	});
}

/**
 * The ChatMessage for a fixed reply in the given language. After the first
 * good build no TTS, ffmpeg or Rhubarb runs again (the cache hit is logged).
 * A degraded build (TTS error, spawn timeout) is returned but not kept, so a
 * transient failure does not stick. A text only request never touches the cache.
 */
export async function getFixedReply(
	key: FixedReplyKey,
	locale: ChatLocale,
	options: { noAudio: boolean },
): Promise<{ message: ChatMessage; cacheHit: boolean }> {
	if (options.noAudio) {
		const spoken = await buildFixedReply(key, locale, true);
		return { message: spoken.message, cacheHit: false };
	}
	const cacheKey = `${locale}:${key}`;
	const existing = cache.get(cacheKey);
	if (existing !== undefined) {
		logger.info("avatar chat fixed reply cache hit", {
			metadata: { key, locale },
			tags: ["avatar-chat", "reply-cache"],
		});
		return { message: (await existing).message, cacheHit: true };
	}
	const building = buildFixedReply(key, locale, false);
	cache.set(cacheKey, building);
	try {
		const spoken = await building;
		if (spoken.degraded && cache.get(cacheKey) === building) {
			cache.delete(cacheKey);
		}
		return { message: spoken.message, cacheHit: false };
	} catch (err) {
		if (cache.get(cacheKey) === building) cache.delete(cacheKey);
		throw err;
	}
}
