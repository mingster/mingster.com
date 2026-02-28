#!/usr/bin/env bun
/**
 * Compress public/models/character.glb with Draco (mesh compression).
 * Overwrites the original file. Run from repo root: bun run bin/compress-character-glb.ts
 */

import { join } from "path";
import { rename, unlink } from "fs/promises";
import { existsSync } from "fs";

const MODELS_DIR = join(import.meta.dir, "..", "public", "models");
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
		{ stdio: "inherit", cwd: join(import.meta.dir, "..") },
	);

	await unlink(INPUT);
	await rename(TMP, INPUT);
	console.log("Compressed and replaced", INPUT);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
