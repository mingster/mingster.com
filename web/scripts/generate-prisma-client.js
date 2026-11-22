// Regenerates the Prisma client from a clean output folder.
//
// `prisma generate` never deletes files an older generator left behind, and a
// leftover client.ts wins module resolution over client.js (see
// src/lib/__tests__/prisma-generated-client.test.ts). So the old folder is
// moved aside, generate runs, and the old folder is deleted only on success.
// On failure it is restored, so a failed generate (for example a missing
// DATABASE_URL during postinstall) never leaves the app without a client.

const { spawnSync } = require("node:child_process");
const { existsSync, renameSync, rmSync } = require("node:fs");
const { join } = require("node:path");

const root = process.cwd();
const outDir = join(root, "prisma/generated/client");
const asideDir = join(root, "prisma/generated/.client-old");

rmSync(asideDir, { recursive: true, force: true });
const hadClient = existsSync(outDir);
if (hadClient) renameSync(outDir, asideDir);

const result = spawnSync("bun", ["x", "prisma", "generate"], {
	cwd: root,
	stdio: "inherit",
});
const ok = result.status === 0 && existsSync(outDir);

if (ok) {
	rmSync(asideDir, { recursive: true, force: true });
	process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
if (hadClient) renameSync(asideDir, outDir);
console.error(
	hadClient
		? "prisma generate failed; restored the previous generated client."
		: "prisma generate failed.",
);
process.exit(result.status || 1);
