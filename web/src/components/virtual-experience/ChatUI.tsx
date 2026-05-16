"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { ANIMATION_KEYS } from "./AvatarGLB";

const SIGNIN_ROUTE = "/signIn";

/** Paths that navigate instead of opening in dialog */
const ROUTE_PATHS = new Set(["/signIn", "/account"]);

const CLEAR_SENTINEL = "__clear__";

/** Slash commands: /command -> { label, path } */
const SLASH_COMMANDS: { command: string; label: string; path: string }[] = [
	{ command: "/blog", label: "Blog", path: "/blog" },
	{ command: "/qrcode", label: "QR Code", path: "/qr-generator" },
	{ command: "/signin", label: "Sign in", path: "/signIn" },
	{ command: "/account", label: "Account", path: "/account" },
	{ command: "/clear", label: "Clear chat history", path: CLEAR_SENTINEL },
];

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

const OWNER_EMAIL = "mingster.tsai@gmail.com";

export function ChatUI() {
	const router = useRouter();
	const {
		chat,
		loading,
		pushAnimationMessage,
		clearMessages,
		soundEnabled,
		setSoundEnabled,
	} = useChat();
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogPath, setDialogPath] = useState<string | null>(null);

	const showCommandList = input.startsWith("/");
	const commandQuery = input.slice(1).toLowerCase().trim();
	const filteredCommands = useMemo(
		() =>
			SLASH_COMMANDS.filter(
				(c) =>
					c.command.slice(1).startsWith(commandQuery) ||
					c.label.toLowerCase().includes(commandQuery),
			),
		[commandQuery],
	);

	useEffect(() => {
		if (!showCommandList) setSelectedCommandIndex(0);
		else
			setSelectedCommandIndex((i) =>
				Math.min(Math.max(0, i), filteredCommands.length - 1),
			);
	}, [showCommandList, filteredCommands.length]);

	const openCommandPage = useCallback(
		(path: string) => {
			setInput("");
			if (path === CLEAR_SENTINEL) {
				clearMessages();
				inputRef.current?.focus();
				return;
			}
			if (ROUTE_PATHS.has(path)) {
				router.push(path);
				return;
			}
			setDialogPath(path);
			setDialogOpen(true);
		},
		[router, clearMessages],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (!showCommandList || filteredCommands.length === 0) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedCommandIndex((i) =>
					Math.min(i + 1, filteredCommands.length - 1),
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedCommandIndex((i) => Math.max(i - 1, 0));
			} else if (e.key === "Enter" && filteredCommands[selectedCommandIndex]) {
				e.preventDefault();
				openCommandPage(filteredCommands[selectedCommandIndex].path);
			}
		},
		[showCommandList, filteredCommands, selectedCommandIndex, openCommandPage],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = input.trim();
			if (loading || !trimmed) return;

			if (showCommandList && filteredCommands[selectedCommandIndex]) {
				openCommandPage(filteredCommands[selectedCommandIndex].path);
				return;
			}

			const lower = trimmed.toLowerCase();
			if (lower === "/clear") {
				clearMessages();
				setInput("");
				inputRef.current?.focus();
				return;
			}
			if (lower === "/signin") {
				router.push(SIGNIN_ROUTE);
				setInput("");
				return;
			}
			if (lower === "/account") {
				router.push("/account");
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
			inputRef.current?.focus();
		},
		[
			chat,
			loading,
			input,
			router,
			pushAnimationMessage,
			clearMessages,
			showCommandList,
			filteredCommands,
			selectedCommandIndex,
			openCommandPage,
		],
	);

	const isOwner = session?.user?.email === OWNER_EMAIL;
	// Subscription check is enforced on the server; client only checks sign-in state.
	// Authorized = owner email. Other signed-in users are allowed to attempt (server gates on subscription).
	const isSignedIn = !!session?.user;

	return (
		<>
			<div className="z-10 shrink-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:absolute md:bottom-0 md:left-0 md:right-0 md:p-4">
				<div className="relative mx-auto max-w-xl rounded-xl border border-white/10 p-3">
					{/* Auth gate */}
					{!sessionLoading && !isSignedIn && (
						<div className="flex items-center justify-between gap-3 py-1">
							<p className="text-sm text-white/70">
								Sign in to start chatting.
							</p>
							<Button
								size="sm"
								variant="outline"
								className="shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20"
								onClick={() => router.push("/signIn")}
							>
								Sign in
							</Button>
						</div>
					)}

					{!sessionLoading && isSignedIn && !isOwner && (
						<p className="mb-2 text-xs text-white/50">
							Chat is available for paid subscribers.{" "}
							<button
								type="button"
								className="underline hover:text-white/80"
								onClick={() => router.push("/account")}
							>
								Manage subscription
							</button>
						</p>
					)}

					{isSignedIn && loading && (
						<div className="mb-2 flex items-center gap-1.5 text-sm text-white/80">
							<span className="size-2 animate-pulse rounded-full bg-white/80" />
							<span className="size-2 animate-pulse rounded-full bg-white/80" />
							<span className="size-2 animate-pulse rounded-full bg-white/80" />
							<span>Thinking...</span>
						</div>
					)}
					{isSignedIn && (
						<form onSubmit={handleSubmit} className="flex gap-2">
							<div className="relative min-h-11 flex-1">
								<Input
									ref={inputRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Type a message or / for commands..."
									className={cn(
										"min-h-11 w-full border border-white/15 bg-white/5 text-base text-white placeholder:text-white/50",
									)}
									autoComplete="off"
								/>
								{showCommandList && (
									<div
										className="absolute bottom-full left-0 right-0 mb-1 max-h-40 overflow-auto rounded-lg border border-white/10 bg-black/20 py-1 backdrop-blur-sm"
										role="listbox"
										aria-label="Commands"
									>
										{filteredCommands.length === 0 ? (
											<div className="px-3 py-2 text-sm text-white/60">
												No matching command
											</div>
										) : (
											filteredCommands.map((cmd, i) => (
												<button
													key={cmd.command}
													type="button"
													role="option"
													aria-selected={i === selectedCommandIndex}
													className={cn(
														"w-full cursor-pointer px-3 py-2 text-left text-sm text-white",
														i === selectedCommandIndex && "bg-white/15",
													)}
													onMouseDown={(e) => {
														e.preventDefault();
														openCommandPage(cmd.path);
													}}
												>
													<span className="font-medium">{cmd.command}</span>
													<span className="ml-2 text-white/70">
														{cmd.label}
													</span>
												</button>
											))
										)}
									</div>
								)}
							</div>
							<Button
								type="submit"
								disabled={loading || !input.trim()}
								className="min-h-11 shrink-0 min-w-18"
							>
								{loading ? "..." : "Send"}
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => setSoundEnabled(!soundEnabled)}
								className={cn(
									"min-h-11 shrink-0",
									soundEnabled
										? "text-white/80 hover:text-white"
										: "text-white/30 hover:text-white/60",
								)}
								title={soundEnabled ? "Mute" : "Unmute"}
							>
								{soundEnabled ? (
									<Volume2 className="size-5" />
								) : (
									<VolumeX className="size-5" />
								)}
							</Button>
						</form>
					)}
				</div>
			</div>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent
					overlayClassName="bg-black/15"
					className="max-h-[95vh] w-[calc(99%)] border-white/10 bg-white/5 p-0 shadow-none sm:max-w-5xl"
					showCloseButton={true}
				>
					<DialogTitle className="sr-only">
						{dialogPath === "/blog"
							? "Blog"
							: dialogPath === "/qr-generator"
								? "QR Code"
								: "Page"}
					</DialogTitle>
					{dialogPath && (
						<iframe
							title={dialogPath}
							src={dialogPath}
							className="h-[95vh] w-full rounded-lg border-0"
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
