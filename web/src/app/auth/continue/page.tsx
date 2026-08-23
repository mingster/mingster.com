import { Suspense } from "react";
import { getT } from "@/app/i18n";
import { Loader } from "@/components/loader";
import { AuthContinueClient } from "./auth-continue-client";

export async function generateMetadata() {
	const { t } = await getT();
	return { title: t("signing_in") };
}

export default function AuthContinuePage() {
	return (
		<Suspense fallback={<Loader />}>
			<AuthContinueClient />
		</Suspense>
	);
}
