import { Suspense } from "react";
import { GetContentTos } from "@/actions/store/get-content-tos";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import {
	Loader,
	DisplayMarkDown,
	Card,
	CardContent,
	Container,
} from "mingster.backbone";

// display terms of service
//
export default async function TermsPage() {
	const TermsOfService = await GetContentTos();

	const { t } = await getT();
	const title = t("page_title_terms");

	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />

			<Container>
				<Card>
					<CardContent>
						{/*display markdown content */}
						<DisplayMarkDown content={TermsOfService} />
					</CardContent>
				</Card>
			</Container>
		</Suspense>
	);
}
