/**
 * Gemini chat: returns array of { text, facialExpression, animation } for the virtual companion.
 * Supports conversation history for multi-turn context.
 */

function buildSystemInstruction(): string {
	const today = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	return `You are a knowledgeable, witty virtual companion living inside a 3D web app. Your name is virtual Ming. Today's date is ${today}.

Your knowledge is current and up to date — you are aware of events, technology, and culture as of 2026. When asked about recent things (AI models, tech releases, current events, pop culture), answer confidently with what you know. Never say your knowledge is outdated or has a cutoff.

You speak in short, natural, conversational replies — like texting a smart friend. Be direct, occasionally funny, and never overly formal.

You must respond with a JSON array of message objects. Each object has exactly:
- "text" (string): what you say
- "facialExpression" (string, one of: neutral, happy, sad, angry, surprised)
- "animation" (string, one of: Idle, Talking, Excited, Dismissing, Researching, Defeated, AskSomebody, IdleHappy, Salute)

Return only the JSON array, no markdown or explanation. Example: [{"text":"Hi there!","facialExpression":"happy","animation":"Talking"}]`;
}

const GEMINI_SYSTEM_INSTRUCTION = buildSystemInstruction();

export interface GeminiMessagePart {
	text: string;
	facialExpression: string;
	animation: string;
}

export interface ChatHistoryEntry {
	role: "user" | "model";
	text: string;
}

export async function getGeminiReply(
	userMessage: string,
	apiKey: string,
	history?: ChatHistoryEntry[],
): Promise<GeminiMessagePart[]> {
	const { GoogleGenerativeAI } = await import("@google/generative-ai");
	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({
		model: "gemini-3.1-flash-lite",
		systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
		generationConfig: {
			responseMimeType: "application/json",
			maxOutputTokens: 1024,
			temperature: 0.8,
		},
	});

	const chatHistory = (history ?? []).map((h) => ({
		role: h.role as "user" | "model",
		parts: [{ text: h.text }],
	}));

	const chatSession = model.startChat({ history: chatHistory });
	const result = await chatSession.sendMessage(userMessage);
	const response = result.response;
	if (!response) {
		throw new Error("No response from Gemini");
	}
	const text = response.text();
	if (!text || !text.trim()) {
		throw new Error("Empty response from Gemini");
	}

	// Parse JSON: may be wrapped in ```json ... ``` or be a raw array
	let raw = text.trim();
	const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (jsonMatch) {
		raw = jsonMatch[1].trim();
	}
	const parsed = JSON.parse(raw) as unknown;
	const arr = Array.isArray(parsed) ? parsed : [parsed];
	return arr.map((item: Record<string, unknown>) => ({
		text: String(item.text ?? ""),
		facialExpression: String(item.facialExpression ?? "neutral"),
		animation: String(item.animation ?? "Idle"),
	}));
}
