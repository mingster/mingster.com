#!/usr/bin/env node
/**
 * Report dependency drift between riben.life and mingster.com package.json.
 * Reports only — never writes. mingster is intentionally ahead on several
 * packages (better-auth, next), so an automatic overwrite would downgrade it.
 *
 * Usage: node dep-drift.mjs <local/package.json> <upstream/package.json>
 */
import { readFileSync } from "node:fs";

const [localPath, upstreamPath] = process.argv.slice(2);
const local = JSON.parse(readFileSync(localPath, "utf8"));
const upstream = JSON.parse(readFileSync(upstreamPath, "utf8"));

/** Compare semver-ish range strings by their numeric core. */
function compare(a, b) {
	const core = (s) => (s.match(/\d+(\.\d+)*/) || ["0"])[0].split(".").map(Number);
	const [x, y] = [core(a), core(b)];
	for (let i = 0; i < Math.max(x.length, y.length); i++) {
		const d = (x[i] ?? 0) - (y[i] ?? 0);
		if (d !== 0) return d > 0 ? 1 : -1;
	}
	return 0;
}

const sections = ["dependencies", "devDependencies"];
const missing = [];   // upstream has it, mingster does not
const behind = [];    // mingster older than upstream
const ahead = [];     // mingster newer than upstream
const removed = [];   // mingster has it, upstream dropped it

for (const section of sections) {
	const l = local[section] ?? {};
	const u = upstream[section] ?? {};
	for (const [name, uv] of Object.entries(u)) {
		const lv = l[name];
		if (lv === undefined) {
			missing.push([section, name, uv]);
			continue;
		}
		if (lv === uv) continue;
		const c = compare(lv, uv);
		if (c < 0) behind.push([section, name, lv, uv]);
		else if (c > 0) ahead.push([section, name, lv, uv]);
	}
	for (const name of Object.keys(l)) {
		if (u[name] === undefined) removed.push([section, name, l[name]]);
	}
}

const bullet = (rows, fmt) => rows.map(fmt).join("\n") || "  (none)";

console.log("## Dependency drift (report only — package.json is never overwritten)\n");

console.log(`### Only in riben.life — likely needed by newly synced code (${missing.length})`);
console.log(bullet(missing, ([s, n, v]) => `  bun add ${s === "devDependencies" ? "-d " : ""}${n}@${v}`));

console.log(`\n### mingster.com is BEHIND riben.life (${behind.length})`);
console.log(bullet(behind, ([s, n, lv, uv]) => `  ${n}: ${lv} -> ${uv}   (${s})`));

console.log(`\n### mingster.com is AHEAD of riben.life — do not downgrade (${ahead.length})`);
console.log(bullet(ahead, ([s, n, lv, uv]) => `  ${n}: local ${lv} > upstream ${uv}   (${s})`));

console.log(`\n### Only in mingster.com — keep (auth/blog/virtual-experience deps) (${removed.length})`);
console.log(bullet(removed, ([s, n, v]) => `  ${n}@${v}   (${s})`));

console.log(
	`\nSummary: ${missing.length} to add, ${behind.length} behind, ${ahead.length} ahead, ${removed.length} local-only.`,
);
