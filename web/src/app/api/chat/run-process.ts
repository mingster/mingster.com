import { spawn } from "node:child_process";

export const FFMPEG_TIMEOUT_MS = 10_000;
export const RHUBARB_TIMEOUT_MS = 15_000;

/** The process ran past its timeout and was killed. */
export class SpawnTimeoutError extends Error {
	constructor(
		readonly command: string,
		readonly timeoutMs: number,
	) {
		super(`${command} timed out after ${timeoutMs}ms`);
		this.name = "SpawnTimeoutError";
	}
}

/**
 * Runs a command to completion. A non zero exit rejects with the stderr tail.
 * Past `timeoutMs` the process is killed with SIGKILL and the promise rejects
 * with {@link SpawnTimeoutError}, so a hung binary cannot hold the stream open.
 */
export function runProcess(
	command: string,
	args: string[],
	timeoutMs: number,
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const proc = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
		let stderr = "";
		let settled = false;
		const settle = (fn: () => void) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			fn();
		};
		const timer = setTimeout(() => {
			proc.kill("SIGKILL");
			settle(() => reject(new SpawnTimeoutError(command, timeoutMs)));
		}, timeoutMs);
		proc.stderr?.on("data", (d) => {
			stderr += d.toString();
		});
		proc.on("close", (code) => {
			settle(() => {
				if (code === 0) resolve();
				else
					reject(new Error(`${command} exited ${code}: ${stderr.slice(-500)}`));
			});
		});
		proc.on("error", (err) => settle(() => reject(err)));
	});
}
