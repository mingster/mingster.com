"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { ChatMessage } from "@/types/virtual-experience";

export interface DisplayEntry {
	role: "user" | "assistant";
	text: string;
	/** For assistant entries: reference to the ChatMessage for active-highlight comparison */
	messageRef?: ChatMessage;
}

export interface ChatContextValue {
	messages: ChatMessage[];
	/** Flat display history with both user and assistant turns */
	displayHistory: DisplayEntry[];
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
	/** Clear all messages and history */
	clearMessages: () => void;
	/** Fetch intro messages (POST with no message); call on mount to show intro. */
	loadIntro: () => Promise<void>;
	/** Push a message with an animation (e.g. "Angry") so the avatar plays the FBX; no API call. */
	pushAnimationMessage: (animation: string, text?: string) => void;
	/** Push a message that loads and plays a clip from a GLB (e.g. "/models/animation.glb"); no API call. */
	pushGlbAnimationMessage: (
		glbPath: string,
		clipIndexOrName?: number | string,
		text?: string,
	) => void;
	/** When set, avatar plays Dance animation (same rig as character). Cleared when stopping. */
	danceTrigger: number | null;
	/** Start playing the Dance clip in a loop (if present in animations.glb). */
	triggerDance: () => void;
	/** Stop dance and return to rest pose. */
	stopDance: () => void;
	/** True when dance is active (no current message and danceTrigger set). */
	isDancing: boolean;
	/** Whether TTS audio is enabled. When false, server skips TTS and client skips playback. */
	soundEnabled: boolean;
	setSoundEnabled: (enabled: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const CHAT_API = "/api/chat";

interface ChatHistoryEntry {
	role: "user" | "model";
	text: string;
}

async function readNdjsonStream(
	res: Response,
	onMessage: (msg: ChatMessage) => void,
) {
	const reader = res.body?.getReader();
	if (!reader) return;
	const decoder = new TextDecoder();
	let buffer = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			try {
				onMessage(JSON.parse(trimmed) as ChatMessage);
			} catch {
				// skip malformed line
			}
		}
	}
}

export function ChatProvider({ children }: { children: ReactNode }) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [displayHistory, setDisplayHistory] = useState<DisplayEntry[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [loading, setLoading] = useState(false);
	const [cameraZoomed, setCameraZoomed] = useState(false);
	const [danceTrigger, setDanceTrigger] = useState<number | null>(null);
	const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
	const [soundEnabled, setSoundEnabledState] = useState(true);

	// Persist sound preference to localStorage
	useEffect(() => {
		const stored = localStorage.getItem("chat:soundEnabled");
		if (stored !== null) setSoundEnabledState(stored !== "false");
	}, []);

	const setSoundEnabled = useCallback((enabled: boolean) => {
		setSoundEnabledState(enabled);
		localStorage.setItem("chat:soundEnabled", String(enabled));
	}, []);

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

			// Show user message immediately
			setDisplayHistory((prev) => [...prev, { role: "user", text: trimmed }]);

			setLoading(true);
			const startIndex = messages.length;
			let isFirst = true;
			const collectedTexts: string[] = [];

			try {
				const res = await fetch(CHAT_API, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: trimmed,
						history: chatHistory,
						noAudio: !soundEnabled,
					}),
				});

				if (!res.ok) throw new Error(res.statusText || "Chat request failed");

				await readNdjsonStream(res, (msg) => {
					collectedTexts.push(msg.text);
					setMessages((prev) => [...prev, msg]);
					if (msg.text.trim()) {
						setDisplayHistory((prev) => [
							...prev,
							{ role: "assistant", text: msg.text, messageRef: msg },
						]);
					}
					if (isFirst) {
						setCurrentIndex((prev) => (prev < 0 ? startIndex : prev));
						isFirst = false;
					}
				});

				setChatHistory((prev) => [
					...prev,
					{ role: "user" as const, text: trimmed },
					{ role: "model" as const, text: collectedTexts.join(" ") },
				]);
			} catch (err) {
				console.error("Chat error:", err);
				const errMsg: ChatMessage = {
					text: err instanceof Error ? err.message : "Something went wrong.",
					facialExpression: "sad",
					animation: "Idle",
				};
				setMessages((prev) => [...prev, errMsg]);
				setDisplayHistory((prev) => [
					...prev,
					{ role: "assistant", text: errMsg.text, messageRef: errMsg },
				]);
			} finally {
				setLoading(false);
			}
		},
		[messages.length, chatHistory, soundEnabled],
	);

	const clearMessages = useCallback(() => {
		setMessages([]);
		setDisplayHistory([]);
		setCurrentIndex(-1);
		setChatHistory([]);
	}, []);

	const triggerDance = useCallback(() => setDanceTrigger(Date.now()), []);
	const stopDance = useCallback(() => setDanceTrigger(null), []);
	const isDancing = danceTrigger !== null && currentMessage === null;

	const loadIntro = useCallback(async () => {
		if (messages.length > 0) return;
		setLoading(true);
		let isFirst = true;
		try {
			const res = await fetch(CHAT_API, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});
			if (!res.ok) return;
			await readNdjsonStream(res, (msg) => {
				setMessages((prev) => [...prev, msg]);
				if (msg.text.trim()) {
					setDisplayHistory((prev) => [
						...prev,
						{ role: "assistant", text: msg.text, messageRef: msg },
					]);
				}
				if (isFirst) {
					setCurrentIndex(0);
					isFirst = false;
				}
			});
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

	const pushGlbAnimationMessage = useCallback(
		(glbPath: string, clipIndexOrName?: number | string, text?: string) => {
			const msg: ChatMessage = {
				text: text ?? "",
				animationGlb: glbPath,
				animationGlbClip: clipIndexOrName ?? 0,
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
		displayHistory,
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
		pushGlbAnimationMessage,
		danceTrigger,
		triggerDance,
		stopDance,
		isDancing,
		soundEnabled,
		setSoundEnabled,
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
