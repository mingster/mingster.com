/**
 * Edge TTS: generate speech from text, optionally convert MP3 → WAV via ffmpeg for Rhubarb.
 * When ffmpeg is not available (e.g. Vercel), returns base64 MP3 and no WAV (lip sync skipped).
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
// Use compiled output; package ships as .ts which Next.js cannot bundle
import { tts } from "edge-tts/out/index.js";

const DEFAULT_VOICE = process.env.EDGE_TTS_VOICE ?? "en-US-JennyNeural";

/**
 * Convert MP3 buffer to WAV using ffmpeg. Returns base64 WAV or null if ffmpeg fails.
 */
async function mp3ToWav(mp3Buffer: Buffer): Promise<string | null> {
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
		await new Promise<void>((resolve, reject) => {
			const proc = spawn(
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
				{ stdio: ["ignore", "pipe", "pipe"] },
			);
			let stderr = "";
			proc.stderr?.on("data", (d) => {
				stderr += d.toString();
			});
			proc.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
			});
			proc.on("error", reject);
		});
		const wavBuffer = fs.readFileSync(wavPath);
		return wavBuffer.toString("base64");
	} catch {
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
	/** Base64-encoded audio (WAV if ffmpeg succeeded, else MP3) */
	audioBase64: string;
	/** True if output is WAV (suitable for Rhubarb); false if MP3 */
	isWav: boolean;
}

/**
 * Generate speech for the given text. Uses Edge TTS; converts to WAV when ffmpeg is available.
 */
export async function textToSpeech(
	text: string,
	voice: string = DEFAULT_VOICE,
): Promise<TtsResult> {
	const mp3Buffer = await tts(text, { voice });
	const wavBase64 = await mp3ToWav(mp3Buffer);
	if (wavBase64) {
		return { audioBase64: wavBase64, isWav: true };
	}
	// Fallback: return MP3 (client can still play it; lip sync will be skipped for this message)
	return { audioBase64: mp3Buffer.toString("base64"), isWav: false };
}
