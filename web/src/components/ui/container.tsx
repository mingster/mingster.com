"use client";

import { cn } from "@/lib/utils";

interface ContainerProps {
	children: React.ReactNode;
	className?: string;
	/** Force full-width inner layout (e.g. embedded previews). */
	fullWidth?: boolean;
}

const Container: React.FC<ContainerProps> = ({
	children,
	className,
	fullWidth = false,
}) => {
	return (
		<div className={cn("w-full min-h-screen min-w-0 pt-2 px-1", className)}>
			<div
				className={cn(
					"rounded min-h-[98%] min-w-0",
					fullWidth ? "w-full max-w-none" : "xl:container xl:mx-auto",
				)}
			>
				{/*bg-gradient-to-b from-indigo-500 via-purple-700 to-indigo-900*/}
				{children}
			</div>
		</div>
	);
};

export default Container;
