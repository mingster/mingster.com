"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

const components: Components = {
	h1: ({ children }) => (
		<h1 className="mt-2 mb-1 text-base font-semibold text-white first:mt-0">
			{children}
		</h1>
	),
	h2: ({ children }) => (
		<h2 className="mt-2 mb-1 text-sm font-semibold text-white first:mt-0">
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="mt-1.5 mb-0.5 text-sm font-semibold text-white/95 first:mt-0">
			{children}
		</h3>
	),
	h4: ({ children }) => (
		<h4 className="mt-1.5 mb-0.5 text-sm font-medium text-white/90 first:mt-0">
			{children}
		</h4>
	),
	h5: ({ children }) => (
		<h5 className="mt-1 mb-0.5 text-sm font-medium text-white/85 first:mt-0">
			{children}
		</h5>
	),
	h6: ({ children }) => (
		<h6 className="mt-1 mb-0.5 text-sm font-medium text-white/80 first:mt-0">
			{children}
		</h6>
	),
	p: ({ children }) => (
		<p className="my-1 leading-snug last:mb-0">{children}</p>
	),
	ul: ({ children }) => (
		<ul className="my-1.5 list-disc space-y-0.5 pl-4 marker:text-white/50">
			{children}
		</ul>
	),
	ol: ({ children }) => (
		<ol className="my-1.5 list-decimal space-y-0.5 pl-4 marker:text-white/50">
			{children}
		</ol>
	),
	li: ({ children }) => (
		<li className="leading-snug [&>ul]:mt-1 [&>ol]:mt-1">{children}</li>
	),
	strong: ({ children }) => (
		<strong className="font-semibold text-white">{children}</strong>
	),
	em: ({ children }) => <em className="italic text-white/90">{children}</em>,
	a: ({ children, href }) => (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="underline decoration-white/40 underline-offset-2 hover:decoration-white"
		>
			{children}
		</a>
	),
	code: ({ children, className }) => {
		const isBlock = Boolean(className);
		if (isBlock) {
			return <code className={className}>{children}</code>;
		}
		return (
			<code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em]">
				{children}
			</code>
		);
	},
	pre: ({ children }) => (
		<pre className="my-2 overflow-x-auto rounded-md bg-black/40 p-2 font-mono text-xs leading-relaxed">
			{children}
		</pre>
	),
	blockquote: ({ children }) => (
		<blockquote className="my-2 border-l-2 border-white/30 pl-3 text-white/75 italic">
			{children}
		</blockquote>
	),
	hr: () => <hr className="my-3 border-white/15" />,
	table: ({ children }) => (
		<div className="my-2 overflow-x-auto">
			<table className="min-w-full border-collapse text-left text-xs">
				{children}
			</table>
		</div>
	),
	thead: ({ children }) => <thead className="bg-white/10">{children}</thead>,
	th: ({ children }) => (
		<th className="border border-white/15 px-2 py-1 font-semibold">
			{children}
		</th>
	),
	td: ({ children }) => (
		<td className="border border-white/15 px-2 py-1">{children}</td>
	),
};

/**
 * Markdown renderer for the virtual-experience chat overlay (always on dark glass).
 * Supports GFM: headers, bullet/numbered lists, tables, strikethrough, etc.
 */
export function ChatMarkdown({
	content,
	className,
}: {
	content: string;
	className?: string;
}) {
	if (!content) return null;

	return (
		<div className={cn("chat-markdown wrap-break-word", className)}>
			<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
				{content}
			</ReactMarkdown>
		</div>
	);
}
