/**
 * TTS: generate speech from text using edge-tts-universal, optionally convert MP3 → WAV via ffmpeg for Rhubarb.
 * When ffmpeg is not available (e.g. Vercel), returns base64 MP3 and no WAV (lip sync skipped).
 * A hung ffmpeg is killed and throws SpawnTimeoutError, so the caller sends the part without audio.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Communicate } from "edge-tts-universal";
import {
	FFMPEG_TIMEOUT_MS,
	runProcess,
	SpawnTimeoutError,
} from "./run-process";

const DEFAULT_VOICE = process.env.EDGE_TTS_VOICE ?? "en-US-JennyNeural";

export interface TtsOptions {
	voice?: string;
	ffmpegTimeoutMs?: number;
}

async function mp3ToWav(
	mp3Buffer: Buffer,
	timeoutMs: number,
): Promise<string | null> {
	const tmpDir = os.tmpdir();
	const mp3Path = path.join(
		tmpDir,
		`tts-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`,
	);
	const wavPath = path.join(
		tmpDir,
		`tts-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`,
	);
	try {
		fs.writeFileSync(mp3Path, mp3Buffer);
		await runProcess(
			"ffmpeg",
			[
				"-y",
				"-i",
				mp3Path,
				"-acodec",
				"pcm_s16le",
				"-ar",
				"44100",
				"-ac",
				"1",
				wavPath,
			],
			timeoutMs,
		);
		return fs.readFileSync(wavPath).toString("base64");
	} catch (err) {
		if (err instanceof SpawnTimeoutError) throw err;
		return null;
	} finally {
		try {
			fs.unlinkSync(mp3Path);
		} catch {
			/* ignore */
		}
		try {
			fs.unlinkSync(wavPath);
		} catch {
			/* ignore */
		}
	}
}

export interface TtsResult {
	audioBase64: string;
	isWav: boolean;
}

export async function textToSpeech(
	text: string,
	options: TtsOptions = {},
): Promise<TtsResult> {
	const communicate = new Communicate(text, {
		voice: options.voice ?? DEFAULT_VOICE,
	});
	const chunks: Buffer[] = [];

	for await (const chunk of communicate.stream()) {
		if (chunk.type === "audio" && chunk.data) {
			chunks.push(Buffer.from(chunk.data));
		}
	}

	const mp3Buffer = Buffer.concat(chunks);
	const wavBase64 = await mp3ToWav(
		mp3Buffer,
		options.ffmpegTimeoutMs ?? FFMPEG_TIMEOUT_MS,
	);
	if (wavBase64) {
		return { audioBase64: wavBase64, isWav: true };
	}
	return { audioBase64: mp3Buffer.toString("base64"), isWav: false };
}
