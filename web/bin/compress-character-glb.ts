#!/usr/bin/env bun
/**
 * Compress public/models/character.glb with Draco (mesh compression).
 * Overwrites the original file. Run from repo root: bun run bin/compress-character-glb.ts
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { rename, unlink } from "fs/promises";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = join(__dirname, "..", "public", "models");
const INPUT = join(MODELS_DIR, "character.glb");
const TMP = join(MODELS_DIR, "character.glb.compressed");

async function main() {
	if (!existsSync(INPUT)) {
		console.error("Not found:", INPUT);
		process.exit(1);
	}

	const { execSync } = await import("child_process");
	execSync(
		`npx gltf-transform draco "${INPUT}" "${TMP}" --method edgebreaker`,
		{ stdio: "inherit", cwd: join(__dirname, "..") },
	);

	await unlink(INPUT);
	await rename(TMP, INPUT);
	console.log("Compressed and replaced", INPUT);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
