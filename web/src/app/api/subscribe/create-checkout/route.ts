import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";
import { ensureStripeCustomer } from "@/actions/user/ensure-stripe-customer";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
		}

		let body: { stripePriceId?: string };
		try {
			body = (await req.json()) as typeof body;
		} catch {
			return NextResponse.json(
				{ message: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const stripePriceId =
			typeof body.stripePriceId === "string" ? body.stripePriceId.trim() : "";
		if (!stripePriceId) {
			return NextResponse.json(
				{ message: "stripePriceId is required" },
				{ status: 400 },
			);
		}

		const setting = await sqlClient.platformSettings.findFirst();
		if (!setting?.stripeProductId) {
			return NextResponse.json(
				{ message: "Subscription not configured" },
				{ status: 500 },
			);
		}

		const price = await stripe.prices.retrieve(stripePriceId);
		const priceProductId =
			typeof price.product === "string" ? price.product : price.product.id;
		if (priceProductId !== setting.stripeProductId) {
			return NextResponse.json(
				{ message: "Invalid price for this subscription product" },
				{ status: 400 },
			);
		}

		const customer = await ensureStripeCustomer(session.user.id);
		if (!customer) {
			return NextResponse.json(
				{ message: "Failed to set up billing" },
				{ status: 500 },
			);
		}

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";

		const checkoutSession = await stripe.checkout.sessions.create({
			customer: customer.id,
			mode: "subscription",
			line_items: [{ price: stripePriceId, quantity: 1 }],
			success_url: `${baseUrl}/subscribe/confirmed?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${baseUrl}/subscribe`,
			metadata: {
				userId: session.user.id,
			},
		});

		return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
	} catch (error) {
		logger.error("create-checkout failed", {
			metadata: {
				error: error instanceof Error ? error.message : String(error),
			},
			tags: ["api", "subscribe", "error"],
		});
		return NextResponse.json(
			{
				message:
					error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}
