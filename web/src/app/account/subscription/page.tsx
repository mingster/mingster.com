import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import { auth } from "@/lib/auth";
import { sqlClient } from "@/lib/prismadb";
import { SubscriptionClient } from "./components/subscription-client";

export const metadata: Metadata = {
	title: "Subscription",
};

export default async function SubscriptionPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user?.id) {
		redirect("/signIn?callbackUrl=/account/subscription");
	}

	const { t } = await getT();

	const subscription = await sqlClient.subscription.findFirst({
		where: { referenceId: session.user.id },
	});

	return (
		<>
			<GlobalNavbar title={t("subscription_page_title")} />
			<div className="mx-auto max-w-4xl px-4 py-8">
				<SubscriptionClient
					subscription={
						subscription
							? {
									id: subscription.id,
									plan: subscription.plan,
									status: subscription.status,
									periodStart: subscription.periodStart?.toISOString() ?? null,
									periodEnd: subscription.periodEnd?.toISOString() ?? null,
									cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
									trialStart: subscription.trialStart?.toISOString() ?? null,
									trialEnd: subscription.trialEnd?.toISOString() ?? null,
								}
							: null
					}
				/>
			</div>
		</>
	);
}
