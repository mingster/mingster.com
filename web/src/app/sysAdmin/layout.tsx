import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getT } from "@/app/i18n";
import { checkAdminAccess } from "@/lib/admin/access";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SysAdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		redirect("/signIn?callbackUrl=/sysAdmin/ai-models");
	}

	if (!(await checkAdminAccess())) {
		const { t } = await getT();
		return (
			<main className="container mx-auto max-w-2xl p-6">
				<p>{t("sysadmin_no_access")}</p>
			</main>
		);
	}

	return <main className="container mx-auto max-w-2xl p-6">{children}</main>;
}
