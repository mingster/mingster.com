import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe/config";
import { sqlClient } from "@/lib/prismadb";
import { SubscribeClient } from "./components/subscribe-client";

export const metadata: Metadata = {
	title: "Subscribe",
};

export default async function SubscribePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user?.id) {
		redirect("/signIn?callbackUrl=/subscribe");
	}

	const { t } = await getT();

	const setting = await sqlClient.platformSettings.findFirst();
	const productId = setting?.stripeProductId?.trim();

	if (!productId) {
		return (
			<>
				<GlobalNavbar title={t("subscription_page_title")} />
				<div className="mx-auto max-w-lg px-4 py-12 text-center">
					<p className="text-muted-foreground">
						Subscription plans are not configured yet.
					</p>
				</div>
			</>
		);
	}

	let prices: {
		id: string;
		nickname: string | null;
		unitAmount: number | null;
		currency: string;
		interval: string | null;
	}[] = [];

	try {
		const res = await stripe.prices.list({
			product: productId,
			active: true,
			limit: 100,
		});
		prices = res.data.map((price) => ({
			id: price.id,
			nickname: price.nickname,
			unitAmount: price.unit_amount,
			currency: price.currency,
			interval: price.recurring?.interval ?? null,
		}));
	} catch {
		prices = [];
	}

	let productName: string | null = null;
	try {
		const product = await stripe.products.retrieve(productId);
		productName = product.name ?? null;
	} catch {
		productName = null;
	}

	const subscription = await sqlClient.subscription.findFirst({
		where: { referenceId: session.user.id },
	});

	return (
		<>
			<GlobalNavbar title={t("subscription_page_title")} />
			<div className="mx-auto max-w-4xl px-4 py-8">
				<SubscribeClient
					prices={prices}
					productName={productName}
					currentSubscription={
						subscription
							? {
									plan: subscription.plan,
									status: subscription.status,
									periodEnd: subscription.periodEnd?.toISOString() ?? null,
									cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
								}
							: null
					}
				/>
			</div>
		</>
	);
}
