"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ChatProvider, useChat } from "@/hooks/useChat";
import { BackgroundSwitcher } from "./BackgroundSwitcher";
import { BACKGROUND_PRESETS } from "./Scene";
import { ChatUI } from "./ChatUI";

const DEFAULT_BG = BACKGROUND_PRESETS[0].image;

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

function VirtualExperienceInner() {
	const { loadIntro } = useChat();
	const [background, setBackground] = useState<string>(DEFAULT_BG);

	useEffect(() => {
		loadIntro();
	}, [loadIntro]);

	return (
		<div className="relative h-screen w-full overflow-hidden">
			<Scene background={background} />
			<div className="absolute left-4 top-4 z-10">
				<BackgroundSwitcher value={background} onChange={setBackground} />
			</div>
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
