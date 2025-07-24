import { Suspense } from "react";
import ClientSignIn from "@/components/auth/client-signin";
import { Loader } from "@/components/ui/loader";

export default async function HomePage() {
	const callbackUrl = "/";

	return (
		<Suspense fallback={<Loader />}>
			<div className="w-full h-screen flex items-center justify-center">
				<ClientSignIn callbackUrl={callbackUrl} />
			</div>
		</Suspense>
	);
}
