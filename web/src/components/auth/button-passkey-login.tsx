"use client";
import { IconKey } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toastError } from "@/components/Toaster";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/providers/i18n-provider";

const PasskeyLoginButton = ({
	callbackUrl = "/",
}: {
	callbackUrl?: string;
}) => {
	const { lng } = useI18n();
	const { t } = useTranslation(lng);

	const router = useRouter();

	const signInPassKey = async () => {
		try {
			const response = await authClient.signIn.passkey({
				fetchOptions: { throw: true },
			});

			if (response?.error) {
				toastError({
					description: response.error.message || "Unknown error",
				});
			} else {
				router.push(callbackUrl);
				//onSuccess()
			}
		} catch (error) {
			toastError({ description: error as string });
		}
	};

	return (
		<Button variant="outline" onClick={signInPassKey}>
			<IconKey className="mr-0 size-4" />
			<span>{t("sign_in_with_passkey")}</span>
		</Button>
	);
};

export default PasskeyLoginButton;
