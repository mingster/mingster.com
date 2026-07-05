"use server";

import logger from "@/lib/logger";
import { purgeStoreFromDatabase } from "@/lib/store/purge-store-from-database";
import { sqlClient } from "@/lib/prismadb";
import { adminActionClient } from "@/utils/actions/safe-action";
import { SafeError } from "@/utils/error";
import { getT } from "@/app/i18n";

import { hardDeleteSysAdminStoreSchema } from "./hard-delete-sysadmin-store.validation";

export const hardDeleteSysAdminStoreAction = adminActionClient
	.metadata({ name: "hardDeleteSysAdminStore" })
	.schema(hardDeleteSysAdminStoreSchema)
	.action(async ({ parsedInput }) => {
		const { id, confirmName } = parsedInput;
		const { t } = await getT();

		const store = await sqlClient.store.findUnique({
			where: { id },
			select: { id: true, name: true, isDeleted: true },
		});

		if (!store) {
			throw new SafeError("Store not found.");
		}

		if (!store.isDeleted) {
			throw new SafeError(t("sysadmin_store_hard_delete_archive_first"));
		}

		if (confirmName !== store.name) {
			throw new SafeError("Confirmation name does not match.");
		}

		await purgeStoreFromDatabase(id);

		logger.info("SysAdmin hard-deleted store", {
			metadata: { storeId: id, storeName: store.name },
			tags: ["sysAdmin", "store", "hard-delete"],
		});

		return { success: true as const, storeId: id };
	});
