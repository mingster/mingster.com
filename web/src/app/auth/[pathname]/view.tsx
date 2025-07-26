"use client";

import { AuthCard } from "@daveyplate/better-auth-ui";
import { useSearchParams } from "next/navigation";
import { getAbsoluteUrl } from "@/utils/utils";

export function AuthView({ pathname }: { pathname: string }) {
	// callback url
	let callbackUrl = useSearchParams().get("callbackUrl");

	//if callbackUrl is not available, use current url
	if (!callbackUrl) {
		callbackUrl = getAbsoluteUrl();
	}

	//console.log("callbackUrl", callbackUrl);
	return (
		<main className="sm:max-w-[100%] flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
			<AuthCard pathname={pathname} redirectTo={callbackUrl || "/"} />
		</main>
	);
}
