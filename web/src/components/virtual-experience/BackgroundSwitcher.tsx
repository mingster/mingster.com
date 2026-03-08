"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BACKGROUND_PRESETS } from "./Scene";

const THUMB_FALLBACK: Record<string, string> = {
	studio: "#2a2d33",
	outdoor: "#3d4a2f",
	indoor: "#2d2a33",
	light: "#e2e4e8",
	dark: "#1e2024",
};

export interface BackgroundSwitcherProps {
	/** Selected background image URL (BACKGROUND_PRESETS[].image). */
	value: string;
	onChange: (imageUrl: string) => void;
	className?: string;
}

/** Avaturn-style horizontal strip of background image thumbnails (hub.avaturn.me/editor). */
export function BackgroundSwitcher({
	value,
	onChange,
	className,
}: BackgroundSwitcherProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 rounded-lg border border-white/20 bg-black/40 p-2 backdrop-blur-sm",
				className,
			)}
			aria-label="Background"
		>
			{BACKGROUND_PRESETS.map((preset) => {
				const isSelected = value === preset.image;
				const fallback = THUMB_FALLBACK[preset.id] ?? "#2a2d33";
				return (
					<button
						key={preset.id}
						type="button"
						onClick={() => onChange(preset.image)}
						className={cn(
							"relative size-12 shrink-0 overflow-hidden rounded-md border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
							isSelected
								? "border-white ring-2 ring-white/50"
								: "border-white/20 hover:border-white/40",
						)}
						style={{ backgroundColor: fallback }}
						title={preset.label}
						aria-label={`Background: ${preset.label}`}
						aria-pressed={isSelected}
					>
						<Image
							src={preset.image}
							alt=""
							width={48}
							height={48}
							className="size-full object-cover"
							unoptimized
							onError={(e) => {
								e.currentTarget.style.display = "none";
							}}
						/>
					</button>
				);
			})}
		</div>
	);
}
