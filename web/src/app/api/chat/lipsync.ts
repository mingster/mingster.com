/**
 * Rhubarb Lip Sync: generate mouth cues from WAV audio.
 * Requires Rhubarb binary on PATH or at RHUBARB_PATH (e.g. web/bin/rhubarb).
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { LipsyncData, MouthCue } from "@/types/virtual-experience";

const RHUBARB_PATH = process.env.RHUBARB_PATH ?? "rhubarb";

/**
 * Run Rhubarb on a WAV file and return mouth cues JSON, or null if Rhubarb is unavailable.
 */
export async function runRhubarb(wavBuffer: Buffer): Promise<LipsyncData | null> {
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
		await new Promise<void>((resolve, reject) => {
			// -f json: output format; -o: output file; -r phonetic: language-independent
			const proc = spawn(RHUBARB_PATH, ["-f", "json", "-o", jsonPath, wavPath, "-r", "phonetic"], {
				stdio: ["ignore", "pipe", "pipe"],
			});
			let stderr = "";
			proc.stderr?.on("data", (d) => {
				stderr += d.toString();
			});
			proc.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`Rhubarb exited ${code}: ${stderr.slice(-500)}`));
			});
			proc.on("error", (err) => reject(err));
		});
		const jsonStr = fs.readFileSync(jsonPath, "utf-8");
		const data = JSON.parse(jsonStr) as { mouthCues?: Array<{ start: number; end: number; value: string }> };
		const mouthCues: MouthCue[] = (data.mouthCues ?? []).map((c) => ({
			start: c.start,
			end: c.end,
			value: c.value,
		}));
		return { mouthCues };
	} catch {
		return null;
	} finally {
		try { fs.unlinkSync(wavPath); } catch { /* ignore */ }
		try { fs.unlinkSync(jsonPath); } catch { /* ignore */ }
	}
}
