"use client";
import { IconHome, IconSettings } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/providers/i18n-provider";
import type { User } from "@/types";
import DialogSignIn from "./dialog-sign-in";
import SignOutButton from "./sign-out-button";

interface UserButtonProps {
	db_user?: User | undefined | null;
	/** When logged out, passed to the sign-in dialog (default `/`). */
	callbackUrl?: string;
}

export default function DropdownUser({
	db_user: _db_user,
	callbackUrl,
}: UserButtonProps) {
	const [mounted, setMounted] = useState(false);
	const { lng } = useI18n();
	const { t } = useTranslation(lng);
	const avatarPlaceholder = "/img/avatar_placeholder.png";

	const { data: session } = authClient.useSession();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return <Skeleton className="size-8 rounded-full" />;

	//logger.info("session", session);

	if (!session) {
		return <DialogSignIn callbackUrl={callbackUrl} />;
	}

	const user = session.user;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					className="flex-none rounded-full border-gray/20 bg-stroke/20 hover:text-meta-1 dark:border-strokedark dark:bg-meta-4 dark:text-primary dark:hover:text-meta-1"
				>
					<Image
						src={user.image || avatarPlaceholder}
						alt="User profile picture"
						width={28}
						height={28}
						className="size-7 rounded-full bg-background object-cover hover:opacity-50"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 sm:w-56 min-w-[200px]">
				<DropdownMenuLabel className="px-2 py-2 sm:px-2 sm:py-1.5">
					{session.user.name || "User"}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem className="cursor-pointer" asChild>
						<Link href="/account" className="flex items-center gap-2">
							<IconSettings className="size-4 shrink-0" />
							<span>{t("user_profile_my_account")}</span>
						</Link>
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem className="cursor-pointer" asChild>
						<Link href="/" className="flex items-center gap-2">
							<IconHome className="size-4 shrink-0" />
							<span>{t("home")}</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuItem className="cursor-pointer" asChild>
					<SignOutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
