"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "@/app/i18n/client";
import { Loader } from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import {
	buildSignInUrl,
	resolveAuthContinueNext,
} from "@/lib/auth-sign-in-urls";
import { useI18n } from "@/providers/i18n-provider";

const SESSION_RETRY_MS = 400;

/**
 * Same-origin hop after OAuth. Waits until `get-session` sees the cookie,
 * then full-navigates to `next` so gated RSCs receive the session.
 */
export function AuthContinueClient() {
	const searchParams = useSearchParams();
	const next = resolveAuthContinueNext(searchParams.get("next"));
	const { data: session, isPending } = authClient.useSession();
	const hasRedirected = useRef(false);
	const { lng } = useI18n();
	const { t } = useTranslation(lng);

	useEffect(() => {
		if (isPending || hasRedirected.current) {
			return;
		}

		if (session?.user) {
			hasRedirected.current = true;
			window.location.replace(next);
			return;
		}

		const retry = window.setTimeout(() => {
			if (hasRedirected.current) {
				return;
			}
			void authClient.getSession().then((result) => {
				if (hasRedirected.current) {
					return;
				}
				hasRedirected.current = true;
				if (result.data?.user) {
					window.location.replace(next);
					return;
				}
				window.location.replace(buildSignInUrl(next));
			});
		}, SESSION_RETRY_MS);

		return () => window.clearTimeout(retry);
	}, [isPending, next, session]);

	return (
		<div
			className="flex min-h-dvh flex-col items-center justify-center px-3"
			aria-busy
			aria-live="polite"
			aria-label={t("signing_in")}
		>
			<Loader />
		</div>
	);
}
