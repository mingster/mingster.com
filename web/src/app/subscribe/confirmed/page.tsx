import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getT } from "@/app/i18n";
import { GlobalNavbar } from "@/components/global-navbar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";

export const metadata: Metadata = {
	title: "Subscription Confirmed",
};

async function syncSubscriptionFromCheckout(sessionId: string, userId: string) {
	try {
		const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
		if (checkoutSession.mode !== "subscription") return;
		if (checkoutSession.payment_status !== "paid") return;

		const subscriptionId =
			typeof checkoutSession.subscription === "string"
				? checkoutSession.subscription
				: (checkoutSession.subscription as any)?.id;
		if (!subscriptionId) return;

		const existing = await sqlClient.subscription.findFirst({
			where: { referenceId: userId, stripeSubscriptionId: subscriptionId },
		});
		if (existing) return;

		const sub = await stripe.subscriptions.retrieve(subscriptionId);
		const planName =
			sub.items.data[0]?.price?.nickname ??
			sub.items.data[0]?.price?.id ??
			"default";
		const item = sub.items.data[0];
		const periodStart = item?.current_period_start
			? new Date(item.current_period_start * 1000)
			: null;
		const periodEnd = item?.current_period_end
			? new Date(item.current_period_end * 1000)
			: null;

		await sqlClient.subscription.upsert({
			where: { referenceId: userId },
			update: {
				plan: planName,
				stripeCustomerId:
					typeof checkoutSession.customer === "string"
						? checkoutSession.customer
						: null,
				stripeSubscriptionId: subscriptionId,
				status: sub.status,
				periodStart,
				periodEnd,
				cancelAtPeriodEnd: sub.cancel_at_period_end,
			},
			create: {
				plan: planName,
				referenceId: userId,
				stripeCustomerId:
					typeof checkoutSession.customer === "string"
						? checkoutSession.customer
						: null,
				stripeSubscriptionId: subscriptionId,
				status: sub.status,
				periodStart,
				periodEnd,
				cancelAtPeriodEnd: sub.cancel_at_period_end,
			},
		});
	} catch (error) {
		logger.error("syncSubscriptionFromCheckout failed", {
			metadata: {
				sessionId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			tags: ["stripe", "subscription", "sync"],
		});
	}
}

export default async function SubscribeConfirmedPage(props: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const searchParams = await props.searchParams;
	const { t } = await getT();

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session?.user?.id) {
		redirect("/signIn?callbackUrl=/subscribe");
	}

	if (!searchParams.session_id) {
		return (
			<>
				<GlobalNavbar title={t("subscription_page_title")} />
				<div className="mx-auto max-w-lg px-4 py-12">
					<Card className="border-destructive/50">
						<CardHeader>
							<CardTitle>Invalid Session</CardTitle>
							<CardDescription>
								No checkout session found. Please try subscribing again.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link href="/subscribe">Back to Plans</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</>
		);
	}

	await syncSubscriptionFromCheckout(searchParams.session_id, session.user.id);

	return (
		<>
			<GlobalNavbar title={t("subscription_page_title")} />
			<div className="mx-auto max-w-lg px-4 py-12">
				<Card className="border-green-300 dark:border-green-700">
					<CardHeader>
						<CardTitle>Subscription Activated</CardTitle>
						<CardDescription>
							Your subscription is now active. Thank you for subscribing!
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						<Button asChild>
							<Link href="/account/subscription">View Subscription</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/">Go Home</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
