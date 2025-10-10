import { Suspense } from "react";
import { GetContentPrivacy } from "@/actions/store/get-content-privacy";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import {
	Loader,
	DisplayMarkDown,
	Card,
	CardContent,
	Container,
} from "mingster.backbone";

// display privacy policy
//
export default async function PrivacyPage() {
	const PrivacyPolicy = await GetContentPrivacy();

	const { t } = await getT();
	const title = t("page_title_privacy");

	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />

			<Container>
				<Card>
					<CardContent>
						{/*display markdown content */}
						<DisplayMarkDown content={PrivacyPolicy} />
					</CardContent>
				</Card>
			</Container>
		</Suspense>
	);
}
