import { z } from "zod";
import { getModelCatalogEntry } from "@/lib/ai/model-catalog";

/** Ids must be in the code catalog. The fallback is optional and must be a different provider. */
export const updateAiModelAssignmentSchema = z
	.object({
		purpose: z.literal("avatar_chat"),
		model: z.string().min(1),
		fallback: z.string().min(1).nullable(),
	})
	.superRefine((input, ctx) => {
		const model = getModelCatalogEntry(input.model);
		if (!model) {
			ctx.addIssue({
				code: "custom",
				path: ["model"],
				message: "Unknown model",
			});
		}
		if (input.fallback === null) return;
		const fallback = getModelCatalogEntry(input.fallback);
		if (!fallback) {
			ctx.addIssue({
				code: "custom",
				path: ["fallback"],
				message: "Unknown model",
			});
		} else if (model && fallback.provider === model.provider) {
			ctx.addIssue({
				code: "custom",
				path: ["fallback"],
				message: "Fallback must use a different provider",
			});
		}
	});

export type UpdateAiModelAssignmentInput = z.infer<
	typeof updateAiModelAssignmentSchema
>;
