"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import type { ChatMessage } from "@/types/virtual-experience";

export interface ChatContextValue {
	messages: ChatMessage[];
	/** Current message being played (for avatar lip sync / animation) */
	currentMessage: ChatMessage | null;
	/** Index in messages of the current one */
	currentIndex: number;
	loading: boolean;
	/** Send user text and append AI response messages */
	chat: (text: string) => Promise<void>;
	/** Called when the current message's audio has finished; advances to next or clears current */
	onMessagePlayed: () => void;
	cameraZoomed: boolean;
	setCameraZoomed: (zoomed: boolean) => void;
	/** Clear all messages (e.g. new conversation) */
	clearMessages: () => void;
	/** Fetch intro messages (POST with no message); call on mount to show intro. */
	loadIntro: () => Promise<void>;
	/** Push a message with an animation (e.g. "Angry") so the avatar plays the FBX; no API call. */
	pushAnimationMessage: (animation: string, text?: string) => void;
	/** Push a message with only a facial expression (e.g. "happy"); no API call, no animation. */
	pushExpressionMessage: (facialExpression: string, text?: string) => void;
	/** When set, avatar plays Dance animation (same rig as character). Cleared when stopping. */
	danceTrigger: number | null;
	/** Start playing the Dance clip in a loop (if present in animations.glb). */
	triggerDance: () => void;
	/** Stop dance and return to rest pose. */
	stopDance: () => void;
	/** True when dance is active (no current message and danceTrigger set). */
	isDancing: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const CHAT_API = "/api/chat";

export function ChatProvider({ children }: { children: ReactNode }) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [loading, setLoading] = useState(false);
	const [cameraZoomed, setCameraZoomed] = useState(false);
	const [danceTrigger, setDanceTrigger] = useState<number | null>(null);

	const currentMessage =
		currentIndex >= 0 && currentIndex < messages.length
			? (messages[currentIndex] ?? null)
			: null;

	const onMessagePlayed = useCallback(() => {
		setCurrentIndex((prev) => {
			const next = prev + 1;
			if (next >= messages.length) return -1;
			return next;
		});
	}, [messages.length]);

	const chat = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed) return;

			setLoading(true);
			try {
				const res = await fetch(CHAT_API, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ message: trimmed }),
				});

				if (!res.ok) {
					const errBody = await res.text();
					throw new Error(res.statusText || errBody || "Chat request failed");
				}

				const data = (await res.json()) as { messages?: ChatMessage[] };
				const newMessages = Array.isArray(data.messages) ? data.messages : [];
				if (newMessages.length === 0) return;

				setMessages((prev) => [...prev, ...newMessages]);
				// If nothing was "current", start playing the first new one
				setCurrentIndex((prev) => {
					if (prev < 0) return messages.length;
					return prev;
				});
			} catch (err) {
				console.error("Chat error:", err);
				// Optionally add an error message to UI
				setMessages((prev) => [
					...prev,
					{
						text: err instanceof Error ? err.message : "Something went wrong.",
						facialExpression: "sad",
						animation: "Idle",
					},
				]);
			} finally {
				setLoading(false);
			}
		},
		[messages.length],
	);

	const clearMessages = useCallback(() => {
		setMessages([]);
		setCurrentIndex(-1);
	}, []);

	const triggerDance = useCallback(() => setDanceTrigger(Date.now()), []);
	const stopDance = useCallback(() => setDanceTrigger(null), []);
	const isDancing = danceTrigger !== null && currentMessage === null;

	const loadIntro = useCallback(async () => {
		if (messages.length > 0) return;
		setLoading(true);
		try {
			const res = await fetch(CHAT_API, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			if (!res.ok) return;
			const data = (await res.json()) as { messages?: ChatMessage[] };
			const intro = Array.isArray(data.messages) ? data.messages : [];
			if (intro.length > 0) {
				setMessages(intro);
				setCurrentIndex(0);
			}
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	}, [messages.length]);

	const pushAnimationMessage = useCallback(
		(animation: string, text?: string) => {
			const msg: ChatMessage = {
				text: text ?? "",
				animation,
			};
			setMessages((prev) => {
				const newIndex = prev.length;
				queueMicrotask(() => setCurrentIndex(newIndex));
				return [...prev, msg];
			});
		},
		[],
	);

	const pushExpressionMessage = useCallback(
		(facialExpression: string, text?: string) => {
			const msg: ChatMessage = {
				text: text ?? "",
				facialExpression,
			};
			setMessages((prev) => {
				const newIndex = prev.length;
				queueMicrotask(() => setCurrentIndex(newIndex));
				return [...prev, msg];
			});
		},
		[],
	);

	const value: ChatContextValue = {
		messages,
		currentMessage,
		currentIndex,
		loading,
		chat,
		onMessagePlayed,
		cameraZoomed,
		setCameraZoomed,
		clearMessages,
		loadIntro,
		pushAnimationMessage,
		pushExpressionMessage,
		danceTrigger,
		triggerDance,
		stopDance,
		isDancing,
	};

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
	const ctx = useContext(ChatContext);
	if (!ctx) {
		throw new Error("useChat must be used within ChatProvider");
	}
	return ctx;
}
