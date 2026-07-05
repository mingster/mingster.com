"use client";

import { useState } from "react";
import type { PaymentMethodColumn } from "../payment-method-column";
import { EditPaymentMethodDialog } from "./edit-payment-method-dialog";

interface PaymentMethodNameCellProps {
	data: PaymentMethodColumn;
	onUpdated?: (paymentMethod: PaymentMethodColumn) => void;
}

export function PaymentMethodNameCell({
	data,
	onUpdated,
}: PaymentMethodNameCellProps) {
	const [isEditOpen, setIsEditOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setIsEditOpen(true)}
				className="cursor-pointer touch-manipulation text-left font-medium text-primary underline-offset-4 hover:underline"
			>
				{data.name}
			</button>
			<EditPaymentMethodDialog
				paymentMethod={data}
				onUpdated={onUpdated}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>
		</>
	);
}
