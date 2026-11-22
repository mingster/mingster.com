"use server";

import { getT } from "@/app/i18n";
import { mergeAssignmentIntoSettingsJson } from "@/lib/ai/load-ai-model-assignment";
import { getModelCatalogEntry } from "@/lib/ai/model-catalog";
import { hasUsableProviderKey } from "@/lib/ai/provider-env-keys";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import { adminActionClient } from "@/utils/actions/safe-action";
import { SafeError } from "@/utils/error";
import { updateAiModelAssignmentSchema } from "./update-ai-model-assignment.validation";

export const updateAiModelAssignmentAction = adminActionClient
	.metadata({ name: "updateAiModelAssignment" })
	.schema(updateAiModelAssignmentSchema)
	.action(async ({ parsedInput: { purpose, model, fallback } }) => {
		// Looked up only on a failure, so the save path never needs the request cookies.
		const saveFailed = async () =>
			new SafeError((await getT()).t("sysadmin_ai_save_failed"));
		const chosen = [model, fallback].flatMap((id) => {
			const entry = id ? getModelCatalogEntry(id) : undefined;
			return entry ? [entry] : [];
		});
		if (chosen.some((entry) => !hasUsableProviderKey(entry.provider))) {
			throw await saveFailed();
		}

		const row = await sqlClient.platformSettings.findFirst({
			select: { id: true, settings: true },
		});
		let settings: string;
		try {
			settings = mergeAssignmentIntoSettingsJson(row?.settings, {
				assigned: { [purpose]: model },
				fallback: fallback ? { [purpose]: fallback } : {},
			});
		} catch (err) {
			logger.error("AI model assignment not saved, settings are not valid", {
				metadata: { errorName: err instanceof Error ? err.name : "unknown" },
				tags: ["ai"],
			});
			throw await saveFailed();
		}
		if (row) {
			await sqlClient.platformSettings.update({
				where: { id: row.id },
				data: { settings },
			});
		} else {
			await sqlClient.platformSettings.create({ data: { settings } });
		}
		logger.info("AI model assignment saved", {
			metadata: { purpose, model, fallback },
			tags: ["ai"],
		});
		return { model, fallback };
	});
