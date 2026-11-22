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
