import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import {
	type AiModelAssignment,
	DEFAULT_AI_MODEL_ASSIGNMENT,
	parseAiModelAssignment,
} from "./model-catalog";

/** Label of the assignment entry inside `PlatformSettings.settings`. */
export const AI_MODEL_ASSIGNMENT_LABEL = "AI.ModelAssignment";

/**
 * Reads the assignment from the raw `PlatformSettings.settings` string, a JSON
 * array of `{ label, value }` pairs. No entry or bad JSON gives the default.
 * Pure, so it runs in unit tests without a database.
 */
export function parseAssignmentFromSettingsJson(
	settingsJson: string | null | undefined,
): AiModelAssignment {
	if (!settingsJson) return DEFAULT_AI_MODEL_ASSIGNMENT;
	try {
		const pairs = JSON.parse(settingsJson) as {
			label?: string;
			value?: string;
		}[];
		const entry = Array.isArray(pairs)
			? pairs.find((item) => item?.label === AI_MODEL_ASSIGNMENT_LABEL)
			: undefined;
		if (!entry?.value) return DEFAULT_AI_MODEL_ASSIGNMENT;
		return parseAiModelAssignment(JSON.parse(entry.value));
	} catch {
		return DEFAULT_AI_MODEL_ASSIGNMENT;
	}
}

/**
 * Writes the assignment into the settings JSON as the `AI.ModelAssignment`
 * entry and keeps every other entry as it was. Throws when the stored text is
 * not a JSON array, so a bad row is never overwritten.
 */
export function mergeAssignmentIntoSettingsJson(
	settingsJson: string | null | undefined,
	assignment: AiModelAssignment,
): string {
	let pairs: { label?: string; value?: string }[] = [];
	if (settingsJson) {
		const parsed: unknown = JSON.parse(settingsJson);
		if (!Array.isArray(parsed)) {
			throw new Error("PlatformSettings.settings is not a JSON array");
		}
		pairs = parsed;
	}
	const value = JSON.stringify({
		...assignment.assigned,
		fallback: assignment.fallback,
	});
	const index = pairs.findIndex(
		(item) => item?.label === AI_MODEL_ASSIGNMENT_LABEL,
	);
	if (index >= 0) pairs[index] = { ...pairs[index], value };
	else pairs.push({ label: AI_MODEL_ASSIGNMENT_LABEL, value });
	return JSON.stringify(pairs);
}

/** Loads the assignment from the first `PlatformSettings` row. A read failure uses the default. */
export async function loadAiModelAssignment(): Promise<AiModelAssignment> {
	try {
		const row = await sqlClient.platformSettings.findFirst({
			select: { settings: true },
		});
		return parseAssignmentFromSettingsJson(row?.settings);
	} catch (err) {
		logger.warn("AI model assignment read failed, using default", {
			metadata: { errorName: err instanceof Error ? err.name : "unknown" },
			tags: ["ai"],
		});
		return DEFAULT_AI_MODEL_ASSIGNMENT;
	}
}
