#!/usr/bin/env node
/**
 * Merge one i18n JSON file: riben (upstream) is the base, keys that exist only
 * in mingster are re-added so local-only strings survive the sync.
 *
 * Usage: node merge-i18n.mjs <upstream.json> <local.json> <out.json>
 * Prints a one-line summary to stdout.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const [upstreamPath, localPath, outPath] = process.argv.slice(2);

if (!upstreamPath || !localPath || !outPath) {
	console.error("usage: merge-i18n.mjs <upstream.json> <local.json> <out.json>");
	process.exit(2);
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// Local file absent -> upstream wins outright.
if (!existsSync(localPath)) {
	writeFileSync(outPath, readFileSync(upstreamPath));
	console.log(`new  ${outPath}`);
	process.exit(0);
}

const upstream = readJson(upstreamPath);
const local = readJson(localPath);

const isPlainObject = (v) =>
	typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep-merge: start from upstream, then graft in subtrees/keys only local has. */
function mergeKeepLocalOnly(up, loc, trail, kept) {
	const out = isPlainObject(up) ? { ...up } : up;
	if (!isPlainObject(up) || !isPlainObject(loc)) return out;

	for (const [key, localValue] of Object.entries(loc)) {
		const path = trail ? `${trail}.${key}` : key;
		if (!(key in up)) {
			out[key] = localValue; // mingster-only -> preserve
			kept.push(path);
		} else if (isPlainObject(up[key]) && isPlainObject(localValue)) {
			out[key] = mergeKeepLocalOnly(up[key], localValue, path, kept);
		}
		// else: key exists upstream -> upstream value wins
	}
	return out;
}

const kept = [];
const merged = mergeKeepLocalOnly(upstream, local, "", kept);

// Stable key order so diffs stay readable across syncs.
function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (!isPlainObject(value)) return value;
	return Object.fromEntries(
		Object.keys(value)
			.sort()
			.map((k) => [k, sortKeys(value[k])]),
	);
}

writeFileSync(outPath, `${JSON.stringify(sortKeys(merged), null, "\t")}\n`);

const countLeaves = (v) =>
	isPlainObject(v)
		? Object.values(v).reduce((n, x) => n + countLeaves(x), 0)
		: 1;

console.log(
	`merged ${outPath}  upstream=${countLeaves(upstream)} local=${countLeaves(local)} result=${countLeaves(merged)} local-only-kept=${kept.length}`,
);
if (process.env.SYNC_VERBOSE === "1" && kept.length) {
	console.log(`  kept: ${kept.slice(0, 40).join(", ")}${kept.length > 40 ? " …" : ""}`);
}
