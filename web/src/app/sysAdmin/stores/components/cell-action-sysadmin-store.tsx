"use client";

import {
	IconDots,
	IconRotateClockwise,
	IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import { restoreSysAdminStoreAction } from "@/actions/sysAdmin/store/restore-sysadmin-store";
import { softDeleteSysAdminStoreAction } from "@/actions/sysAdmin/store/soft-delete-sysadmin-store";
import { useTranslation } from "@/app/i18n/client";
import { AlertModal } from "@/components/modals/alert-modal";
import { toastError, toastSuccess } from "@/components/toaster";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/i18n-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { HardDeleteSysadminStoreDialog } from "./hard-delete-sysadmin-store-dialog";
import { type SysAdminStoreRow, toSysAdminStoreRow } from "../store-column";

interface CellActionSysadminStoreProps {
	item: SysAdminStoreRow;
	onUpdated: (row: SysAdminStoreRow) => void;
	onDeleted: (row: SysAdminStoreRow) => void;
}

export function CellActionSysadminStore({
	item,
	onUpdated,
	onDeleted,
}: CellActionSysadminStoreProps) {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [hardDeleteOpen, setHardDeleteOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const onConfirmSoftDelete = async () => {
		setLoading(true);
		try {
			const result = await softDeleteSysAdminStoreAction({ id: item.id });
			if (result?.serverError) {
				toastError({ description: result.serverError });
				return;
			}
			if (result?.data?.store) {
				onUpdated(toSysAdminStoreRow(result.data.store));
				toastSuccess({ description: "Store archived (soft deleted)." });
			}
		} finally {
			setLoading(false);
			setDeleteOpen(false);
		}
	};

	const onRestore = async () => {
		setLoading(true);
		try {
			const result = await restoreSysAdminStoreAction({ id: item.id });
			if (result?.serverError) {
				toastError({ description: result.serverError });
				return;
			}
			if (result?.data?.store) {
				onUpdated(toSysAdminStoreRow(result.data.store));
				toastSuccess({ description: "Store restored." });
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<HardDeleteSysadminStoreDialog
				store={item}
				open={hardDeleteOpen}
				onOpenChange={setHardDeleteOpen}
				onDeleted={() => onDeleted(item)}
			/>
			<AlertModal
				isOpen={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={onConfirmSoftDelete}
				loading={loading}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="size-8 p-0 touch-manipulation">
						<IconDots className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem className="cursor-pointer" asChild>
						<Link href={`/sysAdmin/stores/${item.id}`}>View detail</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{item.isDeleted ? (
						<>
							<DropdownMenuItem
								className="cursor-pointer"
								disabled={loading}
								onClick={() => void onRestore()}
							>
								<IconRotateClockwise className="mr-2 size-4" />
								Restore
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer text-destructive focus:text-destructive"
								disabled={loading}
								onClick={() => setHardDeleteOpen(true)}
							>
								<IconTrash className="mr-2 size-4" />
								{t("sysadmin_store_delete_permanently")}
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem
							className="cursor-pointer text-destructive focus:text-destructive"
							onClick={() => setDeleteOpen(true)}
						>
							<IconTrash className="mr-2 size-4" />
							Soft delete
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}
