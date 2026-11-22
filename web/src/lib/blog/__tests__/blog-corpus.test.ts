import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const warns: { message: string; opts: unknown }[] = [];
mock.module("@/lib/logger", () => ({
	default: {
		info() {},
		warn: (message: string, opts: unknown) => warns.push({ message, opts }),
		error() {},
		debug() {},
	},
}));

const {
	BLOG_CORPUS_RETRIEVAL_THRESHOLD_BYTES,
	loadBlogCorpus,
	parseBlogPost,
	renderBlogCorpus,
} = await import("../blog-corpus");

const dir = mkdtempSync(join(tmpdir(), "blog-corpus-"));
function post(slug: string, source: string) {
	mkdirSync(join(dir, slug));
	writeFileSync(join(dir, slug, "index.mdx"), source);
}

beforeAll(() => {
	post(
		"2020-01-01-public",
		`import { mingster } from "@/app/blog/authors";
import { Image, YouTubeVideo } from "@/components/media";
import pic from "./pic.jpg";

export const meta = {
  title: "Public post",
  date: "2020-01-01T00:00:00.000Z",
  authors: [mingster],
  image: pic,
};

Hello public body.

<Image alt="x" src={pic} />
<YouTubeVideo id="abc" title="vid" />

Use \`Array<Foo>\` here.
`,
	);
	post(
		"2021-01-01-secret",
		`export const meta = {
  title: "Secret post",
  date: "2021-01-01T00:00:00.000Z",
  private: true,
};

SECRET-BODY-MARKER
`,
	);
	post(
		"2022-01-01-newer",
		`export const meta = {
  title: "Newer 中文",
  date: "2022-01-01T00:00:00.000Z",
};

中文內容
`,
	);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("case 14: loadBlogCorpus", () => {
	test("a private: true post never appears in the corpus", async () => {
		const corpus = await loadBlogCorpus(dir);
		expect(corpus.posts.map((p) => p.slug)).not.toContain("2021-01-01-secret");
		const rendered = renderBlogCorpus(corpus);
		expect(rendered).not.toContain("SECRET-BODY-MARKER");
		expect(rendered).not.toContain("Secret post");
	});

	test("keeps title, date, slug and text; strips imports, meta and JSX tags", async () => {
		const corpus = await loadBlogCorpus(dir);
		const p = corpus.posts.find((x) => x.slug === "2020-01-01-public");
		expect(p).toMatchObject({ title: "Public post", date: "2020-01-01" });
		expect(p?.text).toContain("Hello public body.");
		expect(p?.text).not.toContain("import");
		expect(p?.text).not.toContain("export const meta");
		expect(p?.text).not.toContain("<Image");
		expect(p?.text).not.toContain("<YouTubeVideo");
		expect(p?.text).toContain("`Array<Foo>`");
	});

	test("newest first, and the title list comes before the posts", async () => {
		const corpus = await loadBlogCorpus(dir);
		expect(corpus.posts.map((p) => p.slug)).toEqual([
			"2022-01-01-newer",
			"2020-01-01-public",
		]);
		const rendered = renderBlogCorpus(corpus);
		expect(rendered.indexOf("Titles:")).toBeLessThan(
			rendered.indexOf("### POST:"),
		);
		expect(rendered).toContain("1. Newer 中文 (2022-01-01, 2022-01-01-newer)");
	});

	test("the threshold is 60 KB of stripped text", async () => {
		expect(BLOG_CORPUS_RETRIEVAL_THRESHOLD_BYTES).toBe(60 * 1024);
		expect((await loadBlogCorpus(dir)).overThreshold).toBe(false);
		const big = mkdtempSync(join(tmpdir(), "blog-corpus-big-"));
		mkdirSync(join(big, "a"));
		writeFileSync(
			join(big, "a", "index.mdx"),
			`export const meta = {\n  title: "Big",\n  date: "2020-01-01T00:00:00.000Z",\n};\n\n${"x".repeat(61 * 1024)}\n`,
		);
		expect((await loadBlogCorpus(big)).overThreshold).toBe(true);
		rmSync(big, { recursive: true, force: true });
	});

	test("the real blogData loads, W124 and Musk included", async () => {
		const corpus = await loadBlogCorpus();
		const slugs = corpus.posts.map((p) => p.slug);
		expect(slugs).toContain("2018-04-28-w124_info");
		expect(slugs).toContain("2023-12-17-elon_musk_the_algorithm");
		expect(corpus.overThreshold).toBe(false);
		for (const p of corpus.posts) {
			expect(p.text).not.toContain("export const meta");
			expect(p.text).not.toMatch(/<(Image|YouTubeVideo)\b/);
		}
	});
});

describe("private posts fail closed", () => {
	const wrap = (
		metaBody: string,
		head = "export const meta = {",
		close = "};",
	) =>
		`${head}\n  title: "T",\n  date: "2020-01-01T00:00:00.000Z",\n${metaBody}\n${close}\n\nSECRET-BODY-MARKER\n`;

	const hidden: [string, string][] = [
		["private : true", wrap("  private : true,")],
		['"private": true', wrap('  "private": true,')],
		["private: 'true'", wrap("  private: 'true',")],
		['private: "true"', wrap('  private: "true",')],
		[
			"private: true with a type annotation",
			wrap("  private: true,", "export const meta: Meta = {"),
		],
		[
			"private: true with an indented closing brace",
			wrap("  private: true,", "export const meta = {", "  };"),
		],
		[
			"type annotation and indented brace",
			wrap("  private: true,", "export const meta: Meta = {", "  };"),
		],
		["private: Boolean(true), unparseable", wrap("  private: Boolean(true),")],
		["private: !0, unparseable", wrap("  private: !0,")],
		["no meta block at all", "Just text SECRET-BODY-MARKER\n"],
		[
			"a meta block that never closes",
			'export const meta = {\n  title: "T",\n\nSECRET-BODY-MARKER\n',
		],
	];
	for (const [name, source] of hidden) {
		test(`${name} is skipped`, () => {
			expect(parseBlogPost("x", source)).toBeNull();
		});
	}

	test("a post marked private: false stays public, with a type annotation and indented brace too", () => {
		const p = parseBlogPost(
			"x",
			wrap("  private: false,", "export const meta: Meta = {", "  };"),
		);
		expect(p?.title).toBe("T");
		expect(p?.text).toContain("SECRET-BODY-MARKER");
		expect(p?.text).not.toContain("export const meta");
	});

	test("a post with no private key stays public", () => {
		expect(parseBlogPost("x", wrap(""))?.title).toBe("T");
	});

	test("an unparseable skip logs a warn with the slug only, never the text", () => {
		warns.length = 0;
		parseBlogPost("leaky-slug", wrap("  private: !0,"));
		parseBlogPost("no-meta-slug", "nothing SECRET-BODY-MARKER\n");
		expect(warns).toHaveLength(2);
		expect(JSON.stringify(warns)).toContain("leaky-slug");
		expect(JSON.stringify(warns)).toContain("no-meta-slug");
		expect(JSON.stringify(warns)).not.toContain("SECRET-BODY-MARKER");
	});
});
