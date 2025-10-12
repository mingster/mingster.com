import { Suspense } from "react";
import { GlobalNavbar } from "@/components/global-navbar";
import { redirect } from "next/navigation";
import { Loader } from "@/components/loader";

export default async function HomePage() {
	redirect("/dashboard");

	const title = "mingster.com";
	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />
		</Suspense>
	);
}
