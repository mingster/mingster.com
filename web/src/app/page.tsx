import { Suspense } from "react";
import { GlobalNavbar } from "@/components/global-navbar";
import { Loader } from "mingster.backbone";

export default async function HomePage() {
	const title = "mingster.com";
	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />
		</Suspense>
	);
}
