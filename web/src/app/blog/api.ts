import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Author } from "./authors";
import { format } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getBlogPostBySlug(slug: string): Promise<{
	Component: React.FC;
	meta: {
		title: string;
		date: string;
		excerpt: React.ReactElement;
		authors: Author[];
		description: string;
		image?: {
			src: string;
		};
		private?: boolean;
	};
	slug: string;
} | null> {
	try {
		// Check if the file exists
		if (
			!(await fs
				.stat(path.join(__dirname, `../../../blogData/${slug}/index.mdx`))
				.catch(() => null))
		) {
			return null;
		}

		const mdxModule = await import(`../../../blogData/${slug}/index.mdx`);
		if (!mdxModule.default) {
			return null;
		}

		return {
			Component: mdxModule.default,
			meta: {
				authors: [],
				...mdxModule.meta,
			},
			slug,
		};
	} catch (e) {
		console.error(e);
		return null;
	}
}

export async function getBlogPostSlugs(): Promise<string[]> {
	const posts: { slug: string; date: number }[] = [];

	const folders = await fs.readdir(path.join(__dirname, "../../../blogData"));

	await Promise.allSettled(
		folders.map(async (folder) => {
			if (folder.startsWith(".")) return;
			try {
				const post = await getBlogPostBySlug(folder);
				if (!post) return;

				posts.push({
					slug: post.slug,
					date: new Date(post.meta.date).getTime(),
				});
			} catch (e) {
				console.error(e);
			}
		}),
	);

	posts.sort((a, b) => b.date - a.date);

	return posts.map((post) => post.slug);
}

export function formatDate(timestamp: string) {
	const date = new Date(timestamp);

	return date.toLocaleDateString("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "numeric",
	});
}

export function nonNullable<T>(x: T | null): x is NonNullable<T> {
	return x !== null;
}
