"use client";

import { DropdownUser } from "@/components/auth/dropdown-user";
import { ThemeToggler } from "mingster.backbone";
import { Separator } from "mingster.backbone";
import { SidebarTrigger } from "mingster.backbone";
import { BackgroundImage } from "@/components/BackgroundImage";

export function SiteHeader() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			{/* background image */}
			<BackgroundImage />
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<h1 className="text-base font-medium">Documents</h1>
				<div className="ml-auto flex items-center gap-2">
					<ThemeToggler />
					<DropdownUser />
				</div>
			</div>
		</header>
	);
}
