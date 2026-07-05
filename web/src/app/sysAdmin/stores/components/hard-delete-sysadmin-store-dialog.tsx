"use client";

import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

import { hardDeleteSysAdminStoreAction } from "@/actions/sysAdmin/store/hard-delete-sysadmin-store";
import { useTranslation } from "@/app/i18n/client";
import { toastError, toastSuccess } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useI18n } from "@/providers/i18n-provider";

import type { SysAdminStoreRow } from "../store-column";

interface HardDeleteSysadminStoreDialogProps {
	store: Pick<SysAdminStoreRow, "id" | "name">;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleted: () => void;
}

export function HardDeleteSysadminStoreDialog({
	store,
	open,
	onOpenChange,
	onDeleted,
}: HardDeleteSysadminStoreDialogProps) {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);
	const [typed, setTyped] = useState("");
	const [loading, setLoading] = useState(false);

	const confirmWord = store.name;
	const matches = typed === confirmWord;

	useEffect(() => {
		if (!open) {
			setTyped("");
		}
	}, [open]);

	const handleClose = () => {
		if (loading) return;
		onOpenChange(false);
	};

	const handleConfirm = async () => {
		if (!matches || loading) return;
		setLoading(true);
		try {
			const result = await hardDeleteSysAdminStoreAction({
				id: store.id,
				confirmName: typed,
			});
			if (result?.serverError) {
				toastError({ description: result.serverError });
				return;
			}
			if (result?.data?.success) {
				toastSuccess({ description: t("sysadmin_store_hard_delete_success") });
				onDeleted();
				onOpenChange(false);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={t("sysadmin_store_hard_delete")}
			description={t("sysadmin_store_hard_delete_descr")}
			isOpen={open}
			onClose={handleClose}
		>
			<div className="relative space-y-4" aria-busy={loading}>
				{loading && (
					<div
						className="absolute inset-0 z-100 flex cursor-wait select-none items-center justify-center rounded-lg bg-background/80 backdrop-blur-[2px]"
						aria-live="polite"
						aria-label={t("submitting")}
					>
						<div className="flex flex-col items-center gap-3">
							<ClipLoader size={40} color="#3498db" />
							<span className="text-sm font-medium text-muted-foreground">
								{t("submitting")}
							</span>
						</div>
					</div>
				)}
				<div className="space-y-1">
					<Label className="text-xs">
						{t("danger_type_to_confirm", { word: confirmWord })}
					</Label>
					<Input
						value={typed}
						onChange={(e) => setTyped(e.target.value)}
						placeholder={confirmWord}
						autoComplete="off"
						disabled={loading}
						className="h-10 text-base sm:h-9 sm:text-sm touch-manipulation"
					/>
				</div>
				<div className="flex w-full flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
					<Button
						variant="outline"
						disabled={loading}
						className="h-10 sm:h-9 sm:min-h-0 touch-manipulation"
						onClick={handleClose}
					>
						{t("cancel")}
					</Button>
					<Button
						variant="destructive"
						disabled={!matches || loading}
						className="h-10 sm:h-9 sm:min-h-0 touch-manipulation"
						onClick={() => void handleConfirm()}
					>
						<IconTrash className="mr-2 size-4" />
						{t("sysadmin_store_hard_delete")}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
