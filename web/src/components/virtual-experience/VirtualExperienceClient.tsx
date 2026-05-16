"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatProvider, useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { ChatUI } from "./ChatUI";

const OUTDOOR_BG = "/images/backgrounds/outdoor.jpg";

const Scene = dynamic(
	() => import("./Scene").then((m) => ({ default: m.Scene })),
	{
		ssr: false,
		loading: () => (
			<div className="relative flex h-screen w-full items-center justify-center">
				<div
					className="absolute inset-0 opacity-100 transition-opacity dark:opacity-0"
					style={{
						background:
							"linear-gradient(180deg, #f0f1f3 0%, #e2e4e8 50%, #d8dce0 100%)",
					}}
					aria-hidden
				/>
				<div
					className="absolute inset-0 opacity-0 transition-opacity dark:opacity-100"
					style={{
						background:
							"linear-gradient(180deg, #1e2024 0%, #25282d 50%, #2a2d33 100%)",
					}}
					aria-hidden
				/>
				<div className="relative text-lg text-neutral-500 dark:text-neutral-400">
					Loading experience...
				</div>
			</div>
		),
	},
);

function ChatHistory() {
	const { displayHistory, currentMessage } = useChat();
	const scrollEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [displayHistory]);

	if (displayHistory.length === 0) return null;

	return (
		<div className="absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-6">
			<ScrollArea className="w-full max-w-xl max-h-52 rounded-xl bg-black/40 backdrop-blur-sm">
				<div className="px-5 py-3 space-y-1.5">
					{displayHistory.map((entry, i) => (
						<p
							// biome-ignore lint/suspicious/noArrayIndexKey: entries have no stable id
							key={i}
							className={cn(
								"text-sm leading-snug transition-colors duration-300",
								entry.role === "user"
									? "text-sky-300"
									: entry.messageRef === currentMessage
										? "text-white"
										: "text-white/55",
							)}
						>
							{entry.text}
						</p>
					))}
					<div ref={scrollEndRef} />
				</div>
			</ScrollArea>
		</div>
	);
}

function VirtualExperienceInner() {
	const { loadIntro } = useChat();

	useEffect(() => {
		loadIntro();
	}, [loadIntro]);

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden md:relative">
			<div className="relative min-h-0 flex-1 md:absolute md:inset-0">
				<Scene background={OUTDOOR_BG} />
			</div>
			<ChatHistory />
			<ChatUI />
		</div>
	);
}

export function VirtualExperienceClient() {
	return (
		<ChatProvider>
			<VirtualExperienceInner />
		</ChatProvider>
	);
}
