"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCookies } from "next-client-cookies";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateUserSettingsAction } from "@/actions/user/update-user-settings";
import {
	type UpdateUserSettingsInput,
	updateUserSettingsSchema,
} from "@/actions/user/update-user-settings.validation";
import { useTranslation } from "@/app/i18n/client";
import { cookieName } from "@/app/i18n/settings";
import SignOutButton from "@/components/auth/sign-out-button";
import { LocaleSelectItems } from "@/components/locale-select-items";
import { toastError, toastSuccess } from "@/components/Toaster";
import { TimezoneSelect } from "@/components/timezone-select";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types";

interface props {
	dbUser: User | null | undefined;
}

export default function EditUser({ dbUser }: props) {
	const [loading, setLoading] = useState(false);

	const { i18n } = useTranslation();
	const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);
	const cookies = useCookies();
	const { t } = useTranslation(activeLng);

	const defaultValues = {
		...dbUser,
		//id: user.id,
		//name: user.name || "",
		locale: dbUser.locale || "",
		timezone: dbUser.timezone || "America/Los_Angeles",
	};

	const form = useForm<UpdateUserSettingsInput>({
		resolver: zodResolver(updateUserSettingsSchema),
		defaultValues,
		mode: "onChange",
	});

	const {
		register,
		formState: { errors },
		handleSubmit,
		clearErrors,
	} = form;

	if (dbUser === null || dbUser === undefined) return null;

	async function onSubmit(data: UpdateUserSettingsInput) {
		//console.log("onSubmit", data);

		setLoading(true);
		const result = await updateUserSettingsAction(data);
		if (result?.serverError) {
			toastError({ description: result.serverError });
		} else {
			toastSuccess({ description: "Profile updated." });
			handleChangeLanguage(data.locale);
		}
		setLoading(false);
	}

	const handleChangeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		setActiveLng(lng);
		cookies.set(cookieName, lng, { path: "/" });
		//console.log("activeLng set to: ", lng);
	};

	/*
	console.log("form.formState.isSubmitting", form.formState.isSubmitting);
	console.log("form.formState.isValid", form.formState.isValid);
	console.log("form.formState.errors", form.formState.errors);
	*/

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("account_tabs_account")} </CardTitle>
				<CardDescription> </CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex items-center gap-1">
					{t("account_tab_currentAcct")} {dbUser.email}
					{/* if user doesn't have email, show its userid */}
					{!dbUser.email && dbUser.id}
					<SignOutButton disabled={loading || form.formState.isSubmitting} />
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="max-w-sm space-y-2.5"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("name")}</FormLabel>
									<FormControl>
										<Input
											disabled={loading || form.formState.isSubmitting}
											placeholder="Enter your name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="locale"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("account_tabs_language")}</FormLabel>
									<FormControl>
										<Select
											disabled={loading || form.formState.isSubmitting}
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a default locale" />
											</SelectTrigger>
											<SelectContent>
												<LocaleSelectItems />
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="timezone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("timezone")}</FormLabel>
									<FormControl>
										<TimezoneSelect
											value={field.value}
											onValueChange={field.onChange}
											disabled={loading || form.formState.isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							disabled={
								loading ||
								!form.formState.isValid ||
								form.formState.isSubmitting
							}
						>
							{t("Submit")}
						</Button>
					</form>
				</Form>

				{/* if subscriber, show the cards below
					<ChangeEmailCard />
					<DeleteAccountCard />
					*/}
			</CardContent>
			<CardFooter> </CardFooter>
		</Card>
	);
}
