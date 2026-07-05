import { z } from "zod";

export const hardDeleteSysAdminStoreSchema = z.object({
	id: z.string().min(1),
	confirmName: z.string().min(1),
});

export type HardDeleteSysAdminStoreInput = z.infer<
	typeof hardDeleteSysAdminStoreSchema
>;
