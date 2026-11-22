import fs from "node:fs/promises";
import path from "node:path";
import logger from "@/lib/logger";

/**
 * Above this many bytes of stripped text the whole corpus prompt is too big and
 * riben.life style retrieval (clerk-knowledge.server.ts) is due. Only the check
 * exists today; the retrieval code is a later ticket.
 */
export const BLOG_CORPUS_RETRIEVAL_THRESHOLD_BYTES = 60 * 1024;

export interface BlogCorpusPost {
	slug: string;
	title: string;
	date: string;
	text: string;
}

export interface BlogCorpus {
	posts: BlogCorpusPost[];
	/** Bytes of stripped post text (UTF-8), the number the threshold checks. */
	textBytes: number;
	overThreshold: boolean;
}

/** blogData sits at `<cwd>/blogData` or, from a monorepo root, `<cwd>/web/blogData`. */
async function defaultBlogDataDir(): Promise<string> {
	const cwd = process.cwd();
	const direct = path.join(cwd, "blogData");
	for (const candidate of [direct, path.join(cwd, "web", "blogData")]) {
		if (await fs.stat(candidate).catch(() => null)) return candidate;
	}
	return direct;
}

/** `export const meta = {` or `export const meta: Meta = {`, closed by a `};` line that may be indented. */
const META_RE =
	/^export\s+const\s+meta\s*(?::[^=\n]+)?=\s*\{[\s\S]*?^[ \t]*\};?[ \t]*$/m;
/** The `private` key with optional quotes and spaces; group 1 is the raw value. */
const PRIVATE_KEY_RE = /["']?\bprivate["']?\s*:\s*([^,\n}]*)/i;
/** The word private within a few characters of true, in any shape. */
const PRIVATE_NEAR_TRUE_RE =
	/private[^\n]{0,24}\btrue\b|\btrue\b[^\n]{0,24}private/i;
/** One `import x from "y";` or `import { a, b } from "y";` line, also over several lines. */
const IMPORT_RE =
	/^import\s+(?:[\w*{}\s,]+?\s+from\s+)?["'][^"'\n]+["'];?[ \t]*$/gm;
const FENCE_OR_INLINE_CODE_RE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;
/** An MDX component tag (capital first letter): `<Image ... />`, `<Foo>`, `</Foo>`. */
const JSX_TAG_RE = /<\/?[A-Z][\w.]*(?:\s[^<>]*)?\/?>/g;

function readStringField(meta: string, field: string): string {
	const m = meta.match(
		new RegExp(
			`^\\s*${field}:\\s*("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
			"m",
		),
	);
	if (!m) return "";
	const raw = m[1];
	if (raw.startsWith('"')) {
		try {
			return JSON.parse(raw) as string;
		} catch {
			return raw.slice(1, -1);
		}
	}
	return raw.slice(1, -1).replace(/\\'/g, "'");
}

/** Strip imports, the meta export and JSX tags. Code spans and fences stay as written. */
function stripMdx(source: string): string {
	const withoutHeader = source.replace(META_RE, "").replace(IMPORT_RE, "");
	return withoutHeader
		.split(FENCE_OR_INLINE_CODE_RE)
		.map((chunk, i) => (i % 2 === 1 ? chunk : chunk.replace(JSX_TAG_RE, "")))
		.join("")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function warnSkipped(slug: string, reason: string) {
	// Slug only: never the post text.
	logger.warn("blog corpus post skipped as unsafe", {
		metadata: { slug, reason },
		tags: ["avatar-chat", "blog-corpus"],
	});
}

/**
 * Parse one MDX file. Returns null for a private post or a post with no text.
 * Fails closed: a post whose meta block cannot be parsed, or whose `private`
 * flag is anything but a plain `false`, is skipped.
 */
export function parseBlogPost(
	slug: string,
	source: string,
): BlogCorpusPost | null {
	const meta = source.match(META_RE)?.[0];
	if (!meta) {
		warnSkipped(slug, "no_meta");
		return null;
	}
	const key = meta.match(PRIVATE_KEY_RE);
	if (key) {
		const value = key[1]
			.trim()
			.replace(/^["']|["']$/g, "")
			.toLowerCase();
		if (value !== "false") {
			if (value !== "true") warnSkipped(slug, "unparseable_private");
			return null;
		}
	} else if (PRIVATE_NEAR_TRUE_RE.test(meta)) {
		warnSkipped(slug, "unparseable_private");
		return null;
	}
	const text = stripMdx(source);
	if (!text) return null;
	return {
		slug,
		title: readStringField(meta, "title") || slug,
		date: readStringField(meta, "date").slice(0, 10),
		text,
	};
}

/** Read every public post under `dir`, newest first. A bad post is skipped and logged. */
export async function loadBlogCorpus(dir?: string): Promise<BlogCorpus> {
	const root = dir ?? (await defaultBlogDataDir());
	let folders: string[] = [];
	try {
		folders = await fs.readdir(root);
	} catch (err) {
		logger.warn("blog corpus directory unreadable", {
			metadata: { errorName: err instanceof Error ? err.name : "unknown" },
			tags: ["avatar-chat", "blog-corpus"],
		});
	}
	const posts: BlogCorpusPost[] = [];
	for (const slug of folders.sort()) {
		if (slug.startsWith(".")) continue;
		try {
			const source = await fs.readFile(
				path.join(root, slug, "index.mdx"),
				"utf8",
			);
			const post = parseBlogPost(slug, source);
			if (post) posts.push(post);
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === "ENOENT") continue;
			logger.warn("blog corpus post skipped", {
				metadata: {
					slug,
					errorName: err instanceof Error ? err.name : "unknown",
				},
				tags: ["avatar-chat", "blog-corpus"],
			});
		}
	}
	posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
	const textBytes = posts.reduce(
		(sum, p) => sum + Buffer.byteLength(p.text, "utf8"),
		0,
	);
	return {
		posts,
		textBytes,
		overThreshold: textBytes > BLOG_CORPUS_RETRIEVAL_THRESHOLD_BYTES,
	};
}

let cached: Promise<BlogCorpus> | null = null;

/** The corpus of `web/blogData`, read once per process. An empty result is not kept. */
export function getBlogCorpus(): Promise<BlogCorpus> {
	if (!cached) {
		const pending = loadBlogCorpus();
		cached = pending;
		pending.then(
			(corpus) => {
				if (corpus.posts.length === 0 && cached === pending) cached = null;
			},
			() => {
				if (cached === pending) cached = null;
			},
		);
	}
	return cached;
}

export function clearBlogCorpusCache(): void {
	cached = null;
}

/** Title list first, then every post in full. Sent as data, never in the system field. */
export function renderBlogCorpus(corpus: BlogCorpus): string {
	if (corpus.posts.length === 0) return "Blog posts: (none available)";
	const titles = corpus.posts
		.map((p, i) => `${i + 1}. ${p.title} (${p.date}, ${p.slug})`)
		.join("\n");
	const bodies = corpus.posts
		.map((p) => `### POST: ${p.title} | ${p.date} | ${p.slug}\n${p.text}`)
		.join("\n\n");
	return `Blog posts by Ming (the only source you may answer from).\n\nTitles:\n${titles}\n\nFull posts:\n\n${bodies}`;
}
