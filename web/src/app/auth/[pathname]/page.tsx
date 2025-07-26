import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { Suspense } from "react";
import { GlobalNavbar } from "@/components/global-navbar";
import { Loader } from "@/components/loader";
import { AuthView } from "./view";

export function generateStaticParams() {
	return Object.values(authViewPaths).map((pathname) => ({ pathname }));
}

export default async function AuthPage({
	params,
}: {
	params: Promise<{ pathname: string }>;
}) {
	const { pathname } = await params;

	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title="" />
			<AuthView pathname={pathname} />
		</Suspense>
	);
}
