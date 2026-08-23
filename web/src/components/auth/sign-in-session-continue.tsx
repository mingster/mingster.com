"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "@/app/i18n/client";
import { Loader } from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { resolveOAuthCallbackUrl } from "@/lib/auth-sign-in-urls";
import { useI18n } from "@/providers/i18n-provider";

/**
 * If the OAuth callback bounced `/account` → `/signIn` because the session
 * cookie was not on that first RSC request, the cookie is in the jar now —
 * continue instead of asking the user to sign in again.
 */
export function SignInSessionContinue({
	callbackUrl,
	children,
}: {
	callbackUrl: string;
	children: ReactNode;
}) {
	const dest = resolveOAuthCallbackUrl(callbackUrl);
	const { data: session, isPending } = authClient.useSession();
	const hasRedirected = useRef(false);
	const { lng } = useI18n();
	const { t } = useTranslation(lng);

	useEffect(() => {
		if (isPending || hasRedirected.current || !session?.user) {
			return;
		}
		hasRedirected.current = true;
		window.location.replace(dest);
	}, [dest, isPending, session]);

	if (isPending || session?.user) {
		return (
			<div
				className="flex min-h-0 w-full flex-1 items-center justify-center"
				aria-busy
				aria-live="polite"
				aria-label={t("signing_in")}
			>
				<Loader />
			</div>
		);
	}

	return children;
}
