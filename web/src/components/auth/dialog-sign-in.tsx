// dialog-sign-in.tsx
"use client";
import { IconLogin, IconUserPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/providers/i18n-provider";
import ClientSignIn from "./client-signin";

export default function DialogSignIn({
	callbackUrl = "/",
}: {
	callbackUrl?: string;
}) {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="flex items-center gap-1 pl-2 cursor-pointer hover:text-orange-800 dark:hover:text-orange-300">
					<IconLogin className="mr-0 size-4" />
					<span>{t("signin")}</span>
					<IconUserPlus className="mr-0 size-4" />
					<span>{t("signUp")}</span>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-lg max-h-lg p-2 border-0">
				<DialogHeader>
					<DialogTitle>Welcome</DialogTitle>
					<DialogDescription>
						Sign up or sign in to your account
					</DialogDescription>
				</DialogHeader>
				<ClientSignIn callbackUrl={callbackUrl} noTitle={true} />
			</DialogContent>
		</Dialog>
	);
}
