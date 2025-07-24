import { Suspense } from "react";
import { GlobalNavbar } from "@/components/global-navbar";
import { Loader } from "@/components/ui/loader";

export default async function HomePage() {
	const title = "mingster.com";
	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />
		</Suspense>
	);
}
