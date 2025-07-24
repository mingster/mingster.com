import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import getUser from "@/actions/user/get-user";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import { Loader } from "@/components/ui/loader";
import { auth } from "@/lib/auth";
import type { User } from "@/types";
import { UserClient } from "./components/client-user";

// - user can view its billing history. And cancel service here.
//
export default async function AccountHomePage() {
	// check user session
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	if (!session) {
		redirect("/signin?callbackUrl=/account");
	}

	//log.info({ session: session.user });

	const db_user = (await getUser(session?.user.id)) as User;
	if (!db_user) {
		redirect("/signin?callbackUrl=/account");
	}

	const { t } = await getT();
	const title = t("page_title_account");

	return (
		<Suspense fallback={<Loader />}>
			<GlobalNavbar title={title} />
			<UserClient user={db_user} />
		</Suspense>
	);
}
