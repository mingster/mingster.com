import { z } from "zod";

export const CHAT_TEXT_MAX_CHARS = 2000;
export const CHAT_HISTORY_MAX_ENTRIES = 12;
export const CHAT_UI_LANGUAGES = ["tw", "en", "jp"] as const;
export type ChatUiLanguage = (typeof CHAT_UI_LANGUAGES)[number];

const historyEntrySchema = z.object({
	role: z.enum(["user", "model"]),
	text: z.string().max(CHAT_TEXT_MAX_CHARS),
});

/** Body of POST /api/chat. A missing or empty message asks for the intro. */
export const chatRequestSchema = z.object({
	message: z.string().max(CHAT_TEXT_MAX_CHARS).optional(),
	noAudio: z.boolean().optional(),
	history: z.array(historyEntrySchema).max(CHAT_HISTORY_MAX_ENTRIES).optional(),
	uiLanguage: z.enum(CHAT_UI_LANGUAGES).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
