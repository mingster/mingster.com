"use server";

import Container from "@/components/ui/container";
import { checkAdminAccess } from "../admin-utils";

import { Heading } from "@/components/ui/heading";
import { redirect } from "next/navigation";
import fs from "node:fs";
import { EditDefaultPrivacy } from "./edit-default-privacy";
import { EditDefaultTerms } from "./edit-default-terms";

type Params = Promise<{ storeId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// DashboardPage is home of the selected store. It diesplays store operatiing stat such as
//total revenue, sales count, products, etc..
export default async function StoreAdminDevMaintPage(props: {
	params: Params;
	searchParams: SearchParams;
}) {
	const _params = await props.params;

	const isAdmin = (await checkAdminAccess()) as boolean;
	if (!isAdmin) redirect("/error/?code=500&message=Unauthorized");

	// populate defaults: privacy policy and terms of service
	//
	const termsfilePath = `${process.cwd()}/public/defaults/terms.md`;
	const tos = fs.readFileSync(termsfilePath, "utf8");

	const privacyfilePath = `${process.cwd()}/public/defaults/privacy.md`;
	const privacyPolicy = fs.readFileSync(privacyfilePath, "utf8");

	//console.log(tos);

	//<MaintClient storeId={store.id} />
	return (
		<Container>
			<Heading
				title="Data Maintenance"
				description="Manage store data -- ONLY DO this in development."
			/>

			<EditDefaultPrivacy data={privacyPolicy} />
			<EditDefaultTerms data={tos} />
		</Container>
	);
}
