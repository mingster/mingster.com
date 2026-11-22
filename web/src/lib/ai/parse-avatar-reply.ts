export const AVATAR_EXPRESSIONS = [
	"neutral",
	"happy",
	"sad",
	"angry",
	"surprised",
] as const;

/** Clips that exist in AvatarGLB's ANIMATION_FBX and suit speech. */
export const AVATAR_ANIMATIONS = [
	"Idle",
	"Talking",
	"Excited",
	"Dismissing",
	"Researching",
	"Defeated",
	"AskSomebody",
	"IdleHappy",
	"Salute",
] as const;

export const GROUNDING_VALUES = [
	"grounded",
	"ungrounded",
	"unanswered",
] as const;
export type Grounding = (typeof GROUNDING_VALUES)[number];

export interface AvatarReplyPart {
	text: string;
	facialExpression: string;
	animation: string;
}

export interface AvatarReply {
	parts: AvatarReplyPart[];
	grounding: Grounding;
	offTopic: boolean;
}

/** The model output is not the JSON object the contract asks for. */
export class AvatarReplyParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AvatarReplyParseError";
	}
}

function oneOf<T extends string>(
	value: unknown,
	allowed: readonly T[],
	fallback: T,
): T {
	return typeof value === "string" &&
		(allowed as readonly string[]).includes(value)
		? (value as T)
		: fallback;
}

/** Strips code fences and keeps the outermost `{ ... }`. */
function extractJsonObject(raw: string): string | null {
	const unfenced = raw.replace(/```(?:json)?/gi, "");
	const start = unfenced.indexOf("{");
	const end = unfenced.lastIndexOf("}");
	if (start === -1 || end <= start) return null;
	return unfenced.slice(start, end + 1);
}

/**
 * Tolerant parser for `{ parts, grounding, off_topic }`. An invalid expression
 * becomes `neutral` and an invalid animation `Talking`. Throws
 * {@link AvatarReplyParseError} when no usable part text is found, including
 * truncated JSON.
 */
export function parseAvatarReply(raw: string): AvatarReply {
	const json = extractJsonObject(raw);
	if (!json) throw new AvatarReplyParseError("No JSON object in model output");
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		throw new AvatarReplyParseError("Model output is not valid JSON");
	}
	if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new AvatarReplyParseError("Model output is not a JSON object");
	}
	const record = parsed as Record<string, unknown>;
	if (!Array.isArray(record.parts)) {
		throw new AvatarReplyParseError("Model output has no parts array");
	}
	const parts: AvatarReplyPart[] = [];
	for (const item of record.parts) {
		if (item == null || typeof item !== "object") continue;
		const part = item as Record<string, unknown>;
		const text = typeof part.text === "string" ? part.text.trim() : "";
		if (!text) continue;
		parts.push({
			text,
			facialExpression: oneOf(
				part.facialExpression,
				AVATAR_EXPRESSIONS,
				"neutral",
			),
			animation: oneOf(part.animation, AVATAR_ANIMATIONS, "Talking"),
		});
	}
	if (parts.length === 0) {
		throw new AvatarReplyParseError("Model output has no part text");
	}
	return {
		parts,
		grounding: oneOf(record.grounding, GROUNDING_VALUES, "ungrounded"),
		offTopic: record.off_topic === true,
	};
}
