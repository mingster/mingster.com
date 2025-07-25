"use client";

import { IconHome2 } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownUser from "@/components/auth/dropdown-user";
import { Logo } from "@/components/logo";
import ThemeToggler from "@/components/theme-toggler";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
	title: string;
}

export function GlobalNavbar({ title }: NavbarProps) {
	const [mounted, setMounted] = useState(false);
	const [isOpaque, setIsOpaque] = useState(false);

	useEffect(() => {
		const offset = 50;
		function onScroll() {
			if (!isOpaque && window.scrollY > offset) {
				setIsOpaque(true);
			} else if (isOpaque && window.scrollY <= offset) {
				setIsOpaque(false);
			}
		}
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", onScroll);
		};
	}, [isOpaque]);

	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return <ClipLoader />;

	return (
		<>
			{/* background image*/}
			<div className="absolute inset-x-0 top-0 z-20 flex justify-center overflow-hidden pointer-events-none">
				<div className="w-[108rem] flex-none flex justify-end">
					<picture>
						<source srcSet="/img/beams/docs@30.avif" type="image/avif" />
						<img
							src="/img/beams/docs@tinypng.png"
							alt=""
							className="w-[71.75rem] flex-none max-w-none dark:hidden"
							decoding="async"
						/>
					</picture>
					<picture>
						<source srcSet="/img/beams/docs-dark@30.avif" type="image/avif" />
						<img
							src="/img/beams/docs-dark@tinypng.png"
							alt=""
							className="w-[90rem] flex-none max-w-none hidden dark:block"
							decoding="async"
						/>
					</picture>
				</div>
			</div>
			<div
				className={clsx(
					"sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06]",
					isOpaque
						? "bg-transparent supports-backdrop-blur:bg-white/95 dark:bg-gray-900/5"
						: "bg-transparent supports-backdrop-blur:bg-white/60 dark:bg-gray-900/50",
				)}
			>
				<div className="mx-auto max-w-8xl">
					<div
						className={clsx(
							"py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 mx-4 lg:mx-0",
						)}
					>
						<div className="relative flex items-center justify-between">
							<Link
								href="/"
								className="mr-3 flex-none w-[2.0625rem] overflow-hidden md:w-auto"
								onContextMenu={(e) => {
									e.preventDefault();
									//router.push("/");
								}}
							>
								<span className="sr-only">home page</span>
								<IconHome2 className="w-auto text-sm" />
							</Link>
							<h1>{title}</h1>
							<div className="relative items-center hidden ml-auto lg:flex">
								<nav className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
									<ul className="flex space-x-8 items-center">
										<li className="flex pl-6 ml-6 items-center border-slate-200 dark:border-slate-800">
											<ThemeToggler />
											<DropdownUser />
										</li>
									</ul>
								</nav>
							</div>
							{/* display popover on mobile */}
							<NavPopover className="ml-2 -my-1" display="lg:hidden" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export function NavPopover({
	display = "md:hidden",
	className,
	...props
}: {
	display?: string;
	className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
	const [isOpen, setIsOpen] = useState(false);

	/*
  useEffect(() => {
	if (!isOpen) return;
	function handleRouteChange() {
	  setIsOpen(false);
	}
	Router.events.on("routeChangeComplete", handleRouteChange);
	return () => {
	  Router.events.off("routeChangeComplete", handleRouteChange);
	};
  }, [isOpen]);
  */

	return (
		<div className={clsx(className, display)} {...props}>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild>
					<button
						type="button"
						className="flex items-center justify-center size-8 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
						onClick={() => setIsOpen(true)}
					>
						<span className="sr-only">Navigation</span>
						<svg width="24" height="24" fill="none" aria-hidden="true">
							<path
								d="M12 6v.01M12 12v.01M12 18v.01M12 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</SheetTrigger>
				<SheetContent
					className="flex h-full flex-col px-3 w-64 backdrop-opacity-10 opacity-80 backdrop-invert rounded-lg shadow-lg text-slate-900
          dark:text-slate-400 dark:highlight-white/5 bg-white  dark:bg-slate-800"
					side="right"
				>
					<SheetHeader />
					<SheetTitle />
					<SheetDescription />

					<div className="max-w-xs p-6 text-base font-semibold top-4 right-4">
						<ul className="space-y-6"> {/* TODO: add menu items here */}</ul>
						<div className="flex pt-6 mt-6 border-t border-slate-200 dark:border-slate-200/10">
							<ThemeToggler />
							<DropdownUser />
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
