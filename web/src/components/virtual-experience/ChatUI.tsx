"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { ANIMATION_KEYS } from "./AvatarGLB";

const SIGNIN_ROUTE = "/signIn";

/** Lowercase keyword (and aliases) -> animation key. Used to trigger animation when user types keyword in chat. */
const CHAT_ANIMATION_KEYWORDS: Record<string, string> = (() => {
	const map: Record<string, string> = {};
	for (const key of ANIMATION_KEYS) {
		const lower = key.toLowerCase();
		map[lower] = key;
		map[lower.replace(/_/g, " ")] = key;
		map[lower.replace(/ /g, "_")] = key;
	}
	Object.assign(map, { dance: "Dancing" });
	return map;
})();

export function ChatUI() {
	const router = useRouter();
	const { chat, loading, pushAnimationMessage } = useChat();
	const [input, setInput] = useState("");

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			if (loading || !trimmed) return;

			const lower = trimmed.toLowerCase();
			if (lower === "/signin") {
				router.push(SIGNIN_ROUTE);
				setInput("");
				return;
			}
			const animationKey = CHAT_ANIMATION_KEYWORDS[lower];
			if (animationKey) {
				pushAnimationMessage(
					animationKey,
					`Playing ${animationKey.replace(/_/g, " ")}`,
				);
				setInput("");
				return;
			}

			chat(trimmed);
			setInput("");
		},
		[chat, loading, input, router, pushAnimationMessage],
	);

	return (
		<div className="absolute bottom-0 left-0 right-0 z-10 p-4">
			<div className="mx-auto max-w-xl rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur-sm">
				<div className="mb-2 space-y-2">

				</div>
				{loading && (
					<div className="mb-2 flex items-center gap-1.5 text-sm text-white/80">
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span>Thinking...</span>
					</div>
				)}
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type a message..."
						disabled={loading}
						className={cn(
							"flex-1 border-white/30 bg-white/10 text-white placeholder:text-white/60",
						)}
						autoComplete="off"
					/>
					<Button
						type="submit"
						disabled={loading || !input.trim()}
						className="shrink-0"
					>
						{loading ? "..." : "Send"}
					</Button>
				</form>
			</div>
		</div>
	);
}
