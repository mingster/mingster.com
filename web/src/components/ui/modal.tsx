"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "./scroll-area";

interface ModalProps {
	title: string;
	description: string;
	isOpen: boolean;
	onClose: () => void;
	children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	title,
	description,
	isOpen,
	onClose,
	children,
}) => {
	const onChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onChange} modal={true}>
			<DialogContent className="max-w-3xl xl:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{
							// if description is too long, use scroll area
							description.length > 1000 ? (
								<ScrollArea className="h-[1/4] w-full rounded-md border p-4">
									<ReactMarkdown remarkPlugins={[remarkGfm, remarkHtml]}>
										{description}
									</ReactMarkdown>
								</ScrollArea>
							) : (
								description
							)
						}
					</DialogDescription>
				</DialogHeader>
				<div>{children}</div>
			</DialogContent>
		</Dialog>
	);
};
