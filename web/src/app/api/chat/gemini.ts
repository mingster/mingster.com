/**
 * Gemini chat: returns array of { text, facialExpression, animation } for the virtual companion.
 * Supports conversation history for multi-turn context.
 */

const GEMINI_SYSTEM_INSTRUCTION = `You are a friendly virtual companion in a 3D app. You speak in short, natural replies. You must respond with a JSON array of message objects. Each object has exactly: "text" (string, what you say), "facialExpression" (string, one of: neutral, happy, sad, angry, surprised), "animation" (string, one of: Idle, Talking, Excited, Dismissing, Researching, Defeated, AskSomebody, IdleHappy, Salute). Return only the JSON array, no markdown or explanation. Example: [{"text":"Hi there!","facialExpression":"happy","animation":"Talking"}]`;

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
		model: "gemini-2.0-flash",
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
