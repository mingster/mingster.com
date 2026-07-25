import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { getBlogPostBySlug, getBlogPostSlugs, nonNullable } from "./api";
import GridContainer from "./grid-container";

export const metadata: Metadata = {
	title: "Blog",
	description: "Notes, cheatsheets, and garage logs from mingster.",
	openGraph: {
		type: "article",
		title: "Blog — mingster.com",
		description: "Notes, cheatsheets, and garage logs from mingster.",
		images: "https://mingster.com/api/og?path=/blog",
		url: "https://mingster.com/blog",
	},
};

/** Strip markdown crumbs from meta descriptions for index previews. */
function plainPreview(raw: string | undefined, title: string): string | null {
	if (!raw?.trim()) return null;

	const cleaned = raw
		.replace(/```[\s\S]*?(```|$)/g, " ")
		.replace(/`[^`]*`?/g, " ")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
		.replace(/^#+\s*/gm, "")
		.replace(/[*_~>#]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	const withoutTitle = cleaned
		.replace(new RegExp(`^${escapeRegExp(title)}\\s*[—:\\-–]?\\s*`, "i"), "")
		.trim();

	if (!withoutTitle) return null;
	return withoutTitle.length > 160
		? `${withoutTitle.slice(0, 157).trimEnd()}…`
		: withoutTitle;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function yearOf(date: string) {
	return new Date(date).getFullYear();
}

function shortDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export default async function Blog() {
	const slugs = await getBlogPostSlugs();
	const posts = (await Promise.all(slugs.map(getBlogPostBySlug)))
		.filter(nonNullable)
		.filter((post) => !post.meta.private);

	const byYear: Record<string, typeof posts> = {};
	for (const post of posts) {
		const year = String(yearOf(post.meta.date));
		if (!byYear[year]) byYear[year] = [];
		byYear[year].push(post);
	}

	const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

	return (
		<div className="relative mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 lg:px-2">
			<header className="mb-12 sm:mb-16">
				<GridContainer className="py-6 sm:py-8">
					<p className="font-mono text-[0.7rem] font-medium tracking-[0.22em] text-amber-700 uppercase dark:text-amber-400">
						mingster.com
					</p>
					<h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
						Blog
					</h1>
					<p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/65 sm:text-lg">
						Notes, cheatsheets, and garage logs — tech DIY, hardware, and
						whatever else stuck around.
					</p>
					<p className="mt-5 font-mono text-xs tracking-wide text-foreground/45">
						{posts.length} {posts.length === 1 ? "post" : "posts"}
					</p>
				</GridContainer>
			</header>

			<div className="space-y-14 sm:space-y-16">
				{years.map((year) => (
					<section key={year} aria-labelledby={`year-${year}`}>
						<div className="mb-4 flex items-baseline gap-3 border-b border-foreground/10 pb-2">
							<h2
								id={`year-${year}`}
								className="font-mono text-sm font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-400"
							>
								{year}
							</h2>
							<span className="font-mono text-xs text-foreground/35">
								{byYear[year].length}
							</span>
						</div>

						<ul className="divide-y divide-foreground/10">
							{byYear[year].map(({ meta, slug }) => {
								const preview = plainPreview(meta.description, meta.title);
								const imageSrc = meta.image?.src;

								return (
									<li key={slug}>
										<Link
											href={`/blog/${slug}`}
											className="group flex gap-4 py-5 transition-colors sm:gap-6 sm:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
										>
											<time
												dateTime={meta.date}
												className="mt-1 w-14 shrink-0 font-mono text-xs tracking-wide text-foreground/45 sm:w-16"
											>
												{shortDate(meta.date)}
											</time>

											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-3">
													<h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400 sm:text-xl">
														{meta.title}
													</h3>
													<span
														aria-hidden
														className="mt-1.5 shrink-0 text-foreground/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400"
													>
														<IconArrowUpRight className="size-4" />
													</span>
												</div>

												{preview && (
													<p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/55">
														{preview}
													</p>
												)}
											</div>

											{imageSrc && (
												<div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-md bg-foreground/5 sm:block sm:h-20 sm:w-28">
													<Image
														src={imageSrc}
														alt=""
														fill
														sizes="112px"
														className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
													/>
												</div>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
}
