import { NextResponse } from "next/server";
import type { ChatMessage } from "@/types/virtual-experience";
import type { ChatHistoryEntry } from "./gemini";
import { getGeminiReply } from "./gemini";
import { runRhubarb } from "./lipsync";
import { textToSpeech } from "./tts";

const GEMINI_API_KEY =
	process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;

/**
 * POST /api/chat
 * Body: { message?: string, history?: ChatHistoryEntry[] }
 * Returns: { messages: ChatMessage[] }
 *
 * When message is empty or missing, returns static intro messages.
 * With message: calls Gemini for reply; TTS and lip sync added in later steps.
 */
export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}));
		const message = typeof body.message === "string" ? body.message.trim() : "";
		const history: ChatHistoryEntry[] = Array.isArray(body.history)
			? body.history
			: [];

		// No message → return intro messages (static placeholders)
		if (!message) {
			const introMessages: ChatMessage[] = [
				{
					text: "Hi! I'm your virtual companion. Say something and I'll reply with voice and expressions.",
					facialExpression: "happy",
					animation: "Talking_0",
					audio: undefined,
					lipsync: undefined,
				},
				{
					text: "You can ask me anything, and I'll do my best to keep you company.",
					facialExpression: "neutral",
					animation: "Idle",
					audio: undefined,
					lipsync: undefined,
				},
			];
			return NextResponse.json({ messages: introMessages });
		}

		// Missing API key → return friendly error as a single "message" so UI can show it
		if (!GEMINI_API_KEY) {
			const errorMessages: ChatMessage[] = [
				{
					text: "Chat is not configured yet. Please add GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) to your environment variables. Get a key at https://aistudio.google.com/apikey",
					facialExpression: "sad",
					animation: "Idle",
					audio: undefined,
					lipsync: undefined,
				},
			];
			return NextResponse.json({ messages: errorMessages });
		}

		// Call Gemini with conversation history; then Edge TTS per message; when WAV, run Rhubarb for lip sync
		const parts = await getGeminiReply(message, GEMINI_API_KEY, history);
		const replyMessages: ChatMessage[] = [];
		const disableLipSync = process.env.DISABLE_LIP_SYNC === "true";
		for (const p of parts) {
			let audio: string | undefined;
			let audioMime: "audio/wav" | "audio/mpeg" | undefined;
			let lipsync: ChatMessage["lipsync"];
			try {
				const ttsResult = await textToSpeech(p.text);
				audio = ttsResult.audioBase64;
				audioMime = ttsResult.isWav ? "audio/wav" : "audio/mpeg";
				if (!disableLipSync && ttsResult.isWav && ttsResult.audioBase64) {
					const wavBuffer = Buffer.from(ttsResult.audioBase64, "base64");
					lipsync = (await runRhubarb(wavBuffer)) ?? undefined;
				}
			} catch (ttsErr) {
				console.warn("TTS failed for message:", ttsErr);
			}
			replyMessages.push({
				text: p.text,
				facialExpression: p.facialExpression,
				animation: p.animation,
				audio,
				audioMime,
				lipsync,
			});
		}
		return NextResponse.json({ messages: replyMessages });
	} catch (err) {
		console.error("POST /api/chat error:", err);
		// Return error as a message so the UI can display it
		const errorMessages: ChatMessage[] = [
			{
				text:
					err instanceof Error
						? err.message
						: "Something went wrong. Please try again.",
				facialExpression: "sad",
				animation: "Idle",
				audio: undefined,
				lipsync: undefined,
			},
		];
		return NextResponse.json({ messages: errorMessages });
	}
}
