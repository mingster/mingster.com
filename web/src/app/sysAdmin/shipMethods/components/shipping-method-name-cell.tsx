"use client";

import { useState } from "react";
import type { ShippingMethodColumn } from "../shipping-method-column";
import { EditShippingMethodDialog } from "./edit-shipping-method-dialog";

interface ShippingMethodNameCellProps {
	data: ShippingMethodColumn;
	onUpdated?: (shippingMethod: ShippingMethodColumn) => void;
}

export function ShippingMethodNameCell({
	data,
	onUpdated,
}: ShippingMethodNameCellProps) {
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
			<EditShippingMethodDialog
				shippingMethod={data}
				onUpdated={onUpdated}
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
			/>
		</>
	);
}
