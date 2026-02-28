"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

export function ChatUI() {
	const { chat, loading, isDancing, triggerDance, stopDance } = useChat();
	const [input, setInput] = useState("");

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (loading || !input.trim()) return;
			chat(input.trim());
			setInput("");
		},
		[chat, input, loading],
	);

	return (
		<div className="absolute bottom-0 left-0 right-0 z-10 p-4">
			<div className="mx-auto max-w-xl rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur-sm">
				{loading && (
					<div className="mb-2 flex items-center gap-1.5 text-sm text-white/80">
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span className="size-2 animate-pulse rounded-full bg-white/80" />
						<span>Thinking...</span>
					</div>
				)}
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Button
						type="button"
						variant={isDancing ? "secondary" : "outline"}
						size="sm"
						onClick={isDancing ? stopDance : triggerDance}
						disabled={loading}
						className="shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/20"
					>
						{isDancing ? "Stop" : "Dance"}
					</Button>
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
