/**
 * Rhubarb Lip Sync: generate mouth cues from WAV audio.
 * Requires Rhubarb binary on PATH or at RHUBARB_PATH (e.g. web/bin/rhubarb).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { LipsyncData, MouthCue } from "@/types/virtual-experience";
import {
	RHUBARB_TIMEOUT_MS,
	runProcess,
	SpawnTimeoutError,
} from "./run-process";

/**
 * Run Rhubarb on a WAV file and return mouth cues JSON, or null if Rhubarb is unavailable.
 * A hung Rhubarb is killed and throws SpawnTimeoutError, so the caller sends audio without lip sync.
 */
export async function runRhubarb(
	wavBuffer: Buffer,
	timeoutMs: number = RHUBARB_TIMEOUT_MS,
): Promise<LipsyncData | null> {
	const tmpDir = os.tmpdir();
	const wavPath = path.join(
		tmpDir,
		`lipsync-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`,
	);
	const jsonPath = path.join(
		tmpDir,
		`lipsync-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
	);
	try {
		fs.writeFileSync(wavPath, wavBuffer);
		// -f json: output format; -o: output file; -r phonetic: language-independent
		await runProcess(
			process.env.RHUBARB_PATH ?? "rhubarb",
			["-f", "json", "-o", jsonPath, wavPath, "-r", "phonetic"],
			timeoutMs,
		);
		const jsonStr = fs.readFileSync(jsonPath, "utf-8");
		const data = JSON.parse(jsonStr) as {
			mouthCues?: Array<{ start: number; end: number; value: string }>;
		};
		const mouthCues: MouthCue[] = (data.mouthCues ?? []).map((c) => ({
			start: c.start,
			end: c.end,
			value: c.value,
		}));
		return { mouthCues };
	} catch (err) {
		if (err instanceof SpawnTimeoutError) throw err;
		return null;
	} finally {
		try {
			fs.unlinkSync(wavPath);
		} catch {
			/* ignore */
		}
		try {
			fs.unlinkSync(jsonPath);
		} catch {
			/* ignore */
		}
	}
}
