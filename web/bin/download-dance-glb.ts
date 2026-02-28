#!/usr/bin/env bun
/**
 * Download a dance animation GLB to public/models/dance.glb.
 *
 * Use a GLB that uses the same humanoid rig as your character (e.g. Mixamo
 * generic rig). Then in Blender, merge the "Dance" clip into your
 * animations.glb so the app can play it.
 *
 * Example (set your own URL from Mixamo → mixamo-to-glb.com or similar):
 *   DANCE_GLB_URL="https://example.com/dance.glb" bun run bin/download-dance-glb.ts
 *
 * Or copy your dance.glb manually to web/public/models/dance.glb.
 */

const OUT_DIR = new URL("../public/models", import.meta.url).pathname;
const OUT_FILE = `${OUT_DIR}/dance.glb`;

const url = process.env.DANCE_GLB_URL;
if (!url) {
	console.error(
		"Set DANCE_GLB_URL to a dance animation GLB (same rig as your character).",
	);
	console.error(
		"Example: Get a dance from mixamo.com → export FBX → convert at mixamo-to-glb.com, then:",
	);
	console.error('  DANCE_GLB_URL="https://..." bun run bin/download-dance-glb.ts');
	process.exit(1);
}

async function main() {
	const res = await fetch(url);
	if (!res.ok) {
		console.error("Download failed:", res.status, res.statusText);
		process.exit(1);
	}
	const buf = await res.arrayBuffer();
	const { mkdir, writeFile } = await import("fs/promises");
	await mkdir(OUT_DIR, { recursive: true });
	await writeFile(OUT_FILE, new Uint8Array(buf));
	console.log("Wrote", OUT_FILE);
	console.log(
		"Next: open animations.glb and this file in Blender, retarget the dance to your character's rig, name the action 'Dance', and export as part of animations.glb.",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
