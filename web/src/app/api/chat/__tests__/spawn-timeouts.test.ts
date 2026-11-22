import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let hangTts = false;
let ttsConnections = 0;
mock.module("edge-tts-universal", () => ({
	Communicate: class {
		constructor() {
			ttsConnections++;
		}
		async *stream() {
			if (hangTts) await new Promise(() => {});
			yield { type: "audio", data: new Uint8Array([1, 2, 3]) };
		}
	},
}));

const shimDir = mkdtempSync(join(tmpdir(), "chat-hang-"));
const savedPath = process.env.PATH;
const savedRhubarb = process.env.RHUBARB_PATH;

let runProcess: typeof import("../run-process").runProcess;
let SpawnTimeoutError: typeof import("../run-process").SpawnTimeoutError;
let textToSpeech: typeof import("../tts").textToSpeech;
let runRhubarb: typeof import("../lipsync").runRhubarb;

beforeAll(async () => {
	for (const name of ["ffmpeg", "hang-rhubarb"]) {
		writeFileSync(join(shimDir, name), "#!/bin/sh\nsleep 30\n");
		chmodSync(join(shimDir, name), 0o755);
	}
	process.env.PATH = `${shimDir}:${savedPath}`;
	process.env.RHUBARB_PATH = join(shimDir, "hang-rhubarb");
	({ runProcess, SpawnTimeoutError } = await import("../run-process"));
	({ textToSpeech } = await import("../tts"));
	({ runRhubarb } = await import("../lipsync"));
});

afterAll(() => {
	process.env.PATH = savedPath;
	if (savedRhubarb === undefined) delete process.env.RHUBARB_PATH;
	else process.env.RHUBARB_PATH = savedRhubarb;
	rmSync(shimDir, { recursive: true, force: true });
});

describe("spawn timeouts (case 27)", () => {
	test("runProcess kills a hung process and rejects with SpawnTimeoutError", async () => {
		const started = Date.now();
		const err = await runProcess("sleep", ["30"], 150).catch((e) => e);
		expect(err).toBeInstanceOf(SpawnTimeoutError);
		expect(Date.now() - started).toBeLessThan(3000);
	});

	test("runProcess resolves on exit 0 and rejects on a non zero exit", async () => {
		await runProcess("true", [], 2000);
		await expect(runProcess("false", [], 2000)).rejects.toThrow(/exited 1/);
	});

	test("a hung ffmpeg makes textToSpeech throw SpawnTimeoutError", async () => {
		const err = await textToSpeech("hello", { ffmpegTimeoutMs: 150 }).catch(
			(e) => e,
		);
		expect(err).toBeInstanceOf(SpawnTimeoutError);
	});

	test("a hung Rhubarb makes runRhubarb throw SpawnTimeoutError", async () => {
		const err = await runRhubarb(Buffer.from("wav"), 150).catch((e) => e);
		expect(err).toBeInstanceOf(SpawnTimeoutError);
	});

	test("a hung TTS service makes textToSpeech throw TtsTimeoutError", async () => {
		hangTts = true;
		try {
			const { TtsTimeoutError } = await import("../tts");
			const err = await textToSpeech("hello", { ttsTimeoutMs: 150 }).catch(
				(e) => e,
			);
			expect(err).toBeInstanceOf(TtsTimeoutError);

			// During the cooldown no new connection is opened.
			const before = ttsConnections;
			const again = await textToSpeech("hello").catch((e) => e);
			expect(again).toBeInstanceOf(TtsTimeoutError);
			expect(ttsConnections).toBe(before);
		} finally {
			hangTts = false;
			(await import("../tts")).resetTtsCooldown();
		}
	});

	test("a missing ffmpeg still falls back to mp3 audio", async () => {
		process.env.PATH = "/nonexistent";
		try {
			const result = await textToSpeech("hello", { ffmpegTimeoutMs: 150 });
			expect(result.isWav).toBe(false);
			expect(result.audioBase64.length).toBeGreaterThan(0);
		} finally {
			process.env.PATH = `${shimDir}:${savedPath}`;
		}
	});
});
