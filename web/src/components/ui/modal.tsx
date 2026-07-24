"use client";

import type { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
	title: string;
	description: ReactNode;
	isOpen: boolean;
	onClose: () => void;
	children?: React.ReactNode;
	contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
	title,
	description,
	isOpen,
	onClose,
	children,
	contentClassName,
}) => {
	const onChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onChange}>
			<DialogContent
				className={cn(
					"w-full max-w-[calc(100%-1rem)] max-h-[calc(100vh-2rem)] overflow-y-auto p-4 sm:max-w-lg sm:p-6",
					contentClassName,
				)}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div>{children}</div>
			</DialogContent>
		</Dialog>
	);
};
