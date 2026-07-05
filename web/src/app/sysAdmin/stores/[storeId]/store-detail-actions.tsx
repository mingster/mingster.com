"use client";

import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { restoreSysAdminStoreAction } from "@/actions/sysAdmin/store/restore-sysadmin-store";
import { softDeleteSysAdminStoreAction } from "@/actions/sysAdmin/store/soft-delete-sysadmin-store";
import { useTranslation } from "@/app/i18n/client";
import { AlertModal } from "@/components/modals/alert-modal";
import { toastError, toastSuccess } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";

import { EditSysAdminStoreDialog } from "../components/edit-sysadmin-store-dialog";
import { HardDeleteSysadminStoreDialog } from "../components/hard-delete-sysadmin-store-dialog";
import { type SysAdminStoreRow, toSysAdminStoreRow } from "../store-column";

interface StoreDetailActionsProps {
	store: SysAdminStoreRow;
}

export function StoreDetailActions({
	store: initial,
}: StoreDetailActionsProps) {
	const router = useRouter();
	const { lng } = useI18n();
	const { t } = useTranslation(lng);
	const [store, setStore] = useState(initial);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const onUpdated = (row: SysAdminStoreRow) => {
		setStore((prev) => ({
			...row,
			subscription: row.subscription ?? prev.subscription,
		}));
		router.refresh();
	};

	const onConfirmSoftDelete = async () => {
		setLoading(true);
		try {
			const result = await softDeleteSysAdminStoreAction({ id: store.id });
			if (result?.serverError) {
				toastError({ description: result.serverError });
				return;
			}
			if (result?.data?.store) {
				setStore((prev) => ({
					...toSysAdminStoreRow(result.data.store),
					subscription: prev.subscription,
				}));
				toastSuccess({ description: "Store archived (soft deleted)." });
				router.refresh();
			}
		} finally {
			setLoading(false);
			setDeleteOpen(false);
		}
	};

	const onRestore = async () => {
		setLoading(true);
		try {
			const result = await restoreSysAdminStoreAction({ id: store.id });
			if (result?.serverError) {
				toastError({ description: result.serverError });
				return;
			}
			if (result?.data?.store) {
				setStore((prev) => ({
					...toSysAdminStoreRow(result.data.store),
					subscription: prev.subscription,
				}));
				toastSuccess({ description: "Store restored." });
				router.refresh();
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<HardDeleteSysadminStoreDialog
				store={store}
				open={hardDeleteOpen}
				onOpenChange={setHardDeleteOpen}
				onDeleted={() => router.push("/sysAdmin/stores")}
			/>
			<AlertModal
				isOpen={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={onConfirmSoftDelete}
				loading={loading}
			/>
			<div className="flex flex-wrap gap-2">
				<EditSysAdminStoreDialog store={store} onUpdated={onUpdated} />
				{store.isDeleted ? (
					<>
						<Button
							variant="secondary"
							disabled={loading}
							className="touch-manipulation"
							onClick={() => void onRestore()}
						>
							Restore store
						</Button>
						<Button
							variant="destructive"
							disabled={loading}
							className="touch-manipulation"
							onClick={() => setHardDeleteOpen(true)}
						>
							<IconTrash className="mr-2 size-4" />
							{t("sysadmin_store_delete_permanently")}
						</Button>
					</>
				) : (
					<Button
						variant="destructive"
						disabled={loading}
						className="touch-manipulation"
						onClick={() => setDeleteOpen(true)}
					>
						Soft delete
					</Button>
				)}
			</div>
		</>
	);
}
