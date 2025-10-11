import { notFound } from "next/navigation";
import React from "react";
import { formatDate, getBlogPostBySlug, getBlogPostSlugs } from "../api";
import Image from "next/image";
import GridContainer from "../grid-container";
import type { Metadata } from "next/types";

type Props = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateStaticParams() {
	const slugs = await getBlogPostSlugs();
	return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
	const params = await props.params;
	const post = await getBlogPostBySlug(params.slug);

	if (!post) {
		return notFound();
	}

	return {
		metadataBase: new URL("https://mingster.com"),
		title: post.meta.title,
		description: post.meta.description,
		openGraph: {
			title: post.meta.title,
			description: post.meta.description,
			type: "article",
			url: `/blog/${params.slug}`,
			images: [
				{
					url: post.meta.image
						? post.meta.image.src
						: `/api/og?path=/blog/${params.slug}`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: post.meta.title,
			description: post.meta.description,
			images: [
				{
					url: post.meta.image
						? post.meta.image.src
						: `/api/og?path=/blog/${params.slug}`,
				},
			],
			site: "@mingster",
			creator: "@mingster",
		},
	};
}

export default async function DocPage(props: Props) {
	const params = await props.params;
	const post = await getBlogPostBySlug(params.slug);

	if (!post) {
		return notFound();
	}

	return (
		<>
			{/* Add a placeholder div so the Next.js router can find the scrollable element. */}
			<div hidden />

			<div className="grid grid-cols-1 xl:grid-cols-[22rem_2.5rem_auto] xl:grid-rows-[1fr_auto]">
				<div className="col-start-2 row-span-2 border-r border-l border-gray-950/5 max-xl:hidden dark:border-white/10"></div>

				<div className="max-xl:mx-auto max-xl:w-full max-xl:max-w-(--breakpoint-md)">
					<div className="mt-16 px-4 font-mono text-sm/7 font-medium tracking-widest text-gray-500 uppercase lg:px-2">
						<time dateTime={post.meta.date}>{formatDate(post.meta.date)}</time>
					</div>

					<GridContainer className="mb-6 px-4 lg:px-2 xl:mb-16">
						<h1 className="inline-block max-w-(--breakpoint-md) text-[2.5rem]/10 tracking-tight text-pretty text-gray-950 max-lg:font-medium lg:text-6xl dark:text-gray-200">
							{post.meta.title}
						</h1>
					</GridContainer>
				</div>

				<div className="max-xl:mx-auto max-xl:w-full max-xl:max-w-(--breakpoint-md)">
					<div className="flex flex-col gap-4">
						{post.meta.authors.map((author) => (
							<GridContainer
								direction="to-left"
								key={author.twitter}
								className="flex items-center px-4 py-2 font-medium whitespace-nowrap max-xl:before:-left-[100vw]! max-xl:after:-left-[100vw]! xl:px-2 xl:before:hidden"
							>
								<Author author={author} />
							</GridContainer>
						))}
					</div>
				</div>

				<div className="max-xl:mx-auto max-xl:mt-16 max-xl:w-full max-xl:max-w-(--breakpoint-md)">
					<article className="prose prose-blog max-w-(--breakpoint-md)">
						<post.Component />
					</article>
				</div>
			</div>
		</>
	);
}

function Author({
	author,
}: {
	author: { avatar: string; twitter: string; name: string };
}) {
	return (
		<div className="flex gap-4">
			<Image
				src={author.avatar}
				alt=""
				className="size-12 rounded-full"
				width={36}
				height={36}
			/>
			<div className="flex flex-col justify-center gap-1 text-sm font-semibold">
				<div className="text-gray-950 dark:text-white">{author.name}</div>
				<div>
					<a
						href={`https://twitter.com/${author.twitter}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sky-500 hover:text-sky-600 dark:text-sky-400"
					>
						@{author.twitter}
					</a>
				</div>
			</div>
		</div>
	);
}
