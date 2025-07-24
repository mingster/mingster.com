"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BetterFetchOption } from "better-auth/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "@/app/i18n/client";
import { useCaptcha } from "@/hooks/use-captcha";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/providers/i18n-provider";
import { toastError, toastSuccess } from "../Toaster";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { RecaptchaV3 } from "./recaptcha-v3";

export default function FormMagicLink({
	callbackUrl = "/",
}: {
	callbackUrl?: string;
}) {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);
	const isHydrated = useIsHydrated();
	const { getCaptchaHeaders } = useCaptcha();

	const formSchema = z.object({
		email: z
			.string()
			.min(1, {
				message: `${t("email")} ${t("email_required")}`,
			})
			.email({
				message: `${t("email")} ${t("email_is_invalid")}`,
			}),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setIsSubmitting?.(form.formState.isSubmitting);
	}, [form.formState.isSubmitting]);

	async function sendMagicLink({ email }: z.infer<typeof formSchema>) {
		try {
			const fetchOptions: BetterFetchOption = {
				throw: true,
				headers: await getCaptchaHeaders("magic-link"),
			};

			const { data, error } = await authClient.signIn.magicLink({
				email,
				callbackURL: callbackUrl,
				newUserCallbackURL: "/trial",
				fetchOptions,
			});

			toastSuccess({
				description: t("magic_link_email"),
			});

			form.reset();
		} catch (error: any) {
			console.log(error);
			toastError({ description: error.message });
		}
	}

	return (
		<RecaptchaV3 actionName="magic-link">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(sendMagicLink)}
					noValidate={isHydrated}
					className="grid w-full gap-6"
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("email")}</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder={t("email_placeholder")}
										disabled={isSubmitting}
										{...field}
									/>
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? (
							<Loader2 className="animate-spin" />
						) : (
							t("sign_in_with_magic_link")
						)}
					</Button>
				</form>
			</Form>
		</RecaptchaV3>
	);
}
