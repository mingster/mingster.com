"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

// display markdown content
//
export default function DisplayMarkDown({ content }: { content: string }) {
	if (!content) {
		return "";
	}

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm, remarkRehype, remarkParse]}
			rehypePlugins={[rehypeHighlight]}
			components={{
				p: ({ node, ...props }) => (
					<p className="text-base pt-2 pb-5" {...props} />
				),
				h1: ({ node, ...props }) => (
					<h1 className="text-2xl font-bold pt-2 pb-5" {...props} />
				),
				h2: ({ node, ...props }) => (
					<h2 className="text-xl font-bold pt-2 pb-2" {...props} />
				),
				h3: ({ node, ...props }) => (
					<h3 className="text-lg font-bold pt-2 pb-2" {...props} />
				),
				h4: ({ node, ...props }) => (
					<h4 className="text-base font-bold pt-2 pb-2" {...props} />
				),
				h5: ({ node, ...props }) => (
					<h5 className="text-base font-bold pt-2 pb-5" {...props} />
				),
				h6: ({ node, ...props }) => (
					<h6 className="text-base font-bold pt-2 pb-2" {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className="text-amber-700 dark:text-amber-100 hover:backdrop-contrast-200"
						{...props}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				code: ({ node, ...props }) => (
					<code {...props} className=" p-1 rounded-md font-mono" />
				),
			}}
		>
			{content}
		</ReactMarkdown>
	);
}
