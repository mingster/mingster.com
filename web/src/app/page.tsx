import { Suspense } from "react";
import { Loader } from "@/components/loader";
import { VirtualExperienceClient } from "@/components/virtual-experience/VirtualExperienceClient";

export default function HomePage() {
	return (
		<Suspense fallback={<Loader />}>
			<VirtualExperienceClient />
		</Suspense>
	);
}
