/**
 * Types for the virtual companion chat experience.
 * Matches the API contract: Gemini returns text + facialExpression + animation;
 * API adds audio (base64) and lipsync (mouth cues) per message.
 */

export interface MouthCue {
	start: number;
	end: number;
	value: string;
}

export interface LipsyncData {
	mouthCues: MouthCue[];
}

export interface ChatMessage {
	text: string;
	/** Base64-encoded audio (WAV or MP3 depending on TTS/ffmpeg) */
	audio?: string;
	/** MIME type for audio (default audio/wav when not set) */
	audioMime?: "audio/wav" | "audio/mpeg";
	/** Lip sync mouth cues for viseme animation */
	lipsync?: LipsyncData;
	/** Expression key for morph targets (e.g. "neutral", "happy", "sad") */
	facialExpression?: string;
	/** Animation clip name (e.g. "Idle", "Talking_0", "Laughing") */
	animation?: string;
}

export type FacialExpressionKey =
	| "neutral"
	| "happy"
	| "sad"
	| "angry"
	| "surprised"
	| "disgusted"
	| "fearful";

export type AnimationKey =
	| "Idle"
	| "Talking_0"
	| "Talking_1"
	| "Talking_2"
	| "Laughing"
	| "Crying"
	| string;
