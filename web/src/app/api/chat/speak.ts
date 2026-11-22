import logger from "@/lib/logger";
import type { ChatMessage } from "@/types/virtual-experience";
import { type ChatLocale, voiceForLocale } from "./language";
import { runRhubarb } from "./lipsync";
import { SpawnTimeoutError } from "./run-process";
import { textToSpeech } from "./tts";

export interface SpeakInput {
	text: string;
	facialExpression: string;
	animation: string;
}

export interface SpokenPart {
	message: ChatMessage;
	ttsMs: number;
	rhubarbMs: number;
	/** TTS failed or a spawn timed out. A degraded part is not worth caching. */
	degraded: boolean;
}

/**
 * Turns one reply part into a streamable ChatMessage. An ffmpeg timeout sends
 * the part as text with no audio. A Rhubarb timeout sends audio without lip sync.
 */
export async function speakPart(
	part: SpeakInput,
	locale: ChatLocale,
	options: { noAudio: boolean },
): Promise<SpokenPart> {
	const base: ChatMessage = {
		text: part.text,
		facialExpression: part.facialExpression,
		animation: part.animation,
	};
	if (options.noAudio) {
		return { message: base, ttsMs: 0, rhubarbMs: 0, degraded: false };
	}
	let ttsMs = 0;
	let rhubarbMs = 0;
	let degraded = false;
	const message = { ...base };
	const ttsStarted = Date.now();
	try {
		const tts = await textToSpeech(part.text, {
			voice: voiceForLocale(locale),
		});
		ttsMs = Date.now() - ttsStarted;
		message.audio = tts.audioBase64;
		message.audioMime = tts.isWav ? "audio/wav" : "audio/mpeg";
		if (process.env.DISABLE_LIP_SYNC !== "true" && tts.isWav) {
			const rhubarbStarted = Date.now();
			try {
				message.lipsync =
					(await runRhubarb(Buffer.from(tts.audioBase64, "base64"))) ??
					undefined;
			} catch (err) {
				degraded = true;
				logger.warn("avatar chat rhubarb failed", {
					metadata: { errorName: errorName(err), locale },
					tags: ["avatar-chat", "rhubarb"],
				});
			}
			rhubarbMs = Date.now() - rhubarbStarted;
		}
	} catch (err) {
		ttsMs = Date.now() - ttsStarted;
		degraded = true;
		logger.warn("avatar chat tts failed", {
			metadata: { errorName: errorName(err), locale },
			tags: [
				"avatar-chat",
				err instanceof SpawnTimeoutError ? "ffmpeg" : "tts",
			],
		});
	}
	return { message, ttsMs, rhubarbMs, degraded };
}

function errorName(err: unknown): string {
	return err instanceof Error ? err.name : "unknown";
}
