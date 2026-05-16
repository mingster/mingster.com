import type Stripe from "stripe";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";

function getItemPeriod(sub: Stripe.Subscription) {
	const item = sub.items.data[0];
	return {
		start: item?.current_period_start ?? null,
		end: item?.current_period_end ?? null,
	};
}

export async function handleStripeSubscriptionEvent(
	event: Stripe.Event,
): Promise<void> {
	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			if (session.mode !== "subscription") return;

			const userId = session.metadata?.userId;
			const subscriptionId =
				typeof session.subscription === "string"
					? session.subscription
					: (session.subscription as Stripe.Subscription)?.id;

			if (!userId || !subscriptionId) return;

			const { stripe } = await import("@/lib/stripe/config");
			const sub = await stripe.subscriptions.retrieve(subscriptionId);
			const planName =
				sub.items.data[0]?.price?.nickname ??
				sub.items.data[0]?.price?.id ??
				"default";
			const period = getItemPeriod(sub);

			await sqlClient.subscription.upsert({
				where: { referenceId: userId },
				update: {
					plan: planName,
					stripeCustomerId:
						typeof session.customer === "string" ? session.customer : null,
					stripeSubscriptionId: subscriptionId,
					status: sub.status,
					periodStart: period.start ? new Date(period.start * 1000) : null,
					periodEnd: period.end ? new Date(period.end * 1000) : null,
					cancelAtPeriodEnd: sub.cancel_at_period_end,
				},
				create: {
					plan: planName,
					referenceId: userId,
					stripeCustomerId:
						typeof session.customer === "string" ? session.customer : null,
					stripeSubscriptionId: subscriptionId,
					status: sub.status,
					periodStart: period.start ? new Date(period.start * 1000) : null,
					periodEnd: period.end ? new Date(period.end * 1000) : null,
					cancelAtPeriodEnd: sub.cancel_at_period_end,
				},
			});

			logger.info("Subscription created via checkout", {
				metadata: { userId, subscriptionId, plan: planName },
				tags: ["stripe", "subscription"],
			});
			break;
		}

		case "customer.subscription.updated": {
			const sub = event.data.object as Stripe.Subscription;
			const existing = await sqlClient.subscription.findFirst({
				where: { stripeSubscriptionId: sub.id },
			});
			if (!existing) return;

			const planName =
				sub.items.data[0]?.price?.nickname ??
				sub.items.data[0]?.price?.id ??
				existing.plan;
			const period = getItemPeriod(sub);

			await sqlClient.subscription.update({
				where: { id: existing.id },
				data: {
					plan: planName,
					status: sub.status,
					periodStart: period.start ? new Date(period.start * 1000) : null,
					periodEnd: period.end ? new Date(period.end * 1000) : null,
					cancelAtPeriodEnd: sub.cancel_at_period_end,
				},
			});

			logger.info("Subscription updated", {
				metadata: { subscriptionId: sub.id, status: sub.status },
				tags: ["stripe", "subscription"],
			});
			break;
		}

		case "customer.subscription.deleted": {
			const sub = event.data.object as Stripe.Subscription;
			const existing = await sqlClient.subscription.findFirst({
				where: { stripeSubscriptionId: sub.id },
			});
			if (!existing) return;

			await sqlClient.subscription.update({
				where: { id: existing.id },
				data: {
					status: "canceled",
					cancelAtPeriodEnd: false,
				},
			});

			logger.info("Subscription canceled", {
				metadata: { subscriptionId: sub.id },
				tags: ["stripe", "subscription"],
			});
			break;
		}
	}
}
