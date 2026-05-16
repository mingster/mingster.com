import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";

export async function POST(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});
		if (!session?.user?.id) {
			return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });
		}

		let body: { returnUrl?: string };
		try {
			body = (await req.json()) as typeof body;
		} catch {
			body = {};
		}

		const user = await sqlClient.user.findUnique({
			where: { id: session.user.id },
		});
		if (!user?.stripeCustomerId) {
			return NextResponse.json(
				{ message: "No billing account found" },
				{ status: 400 },
			);
		}

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002";
		const returnUrl = body.returnUrl || `${baseUrl}/account/subscription`;

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: user.stripeCustomerId,
			return_url: returnUrl,
		});

		return NextResponse.json({ url: portalSession.url }, { status: 200 });
	} catch (error) {
		logger.error("billing-portal failed", {
			metadata: {
				error: error instanceof Error ? error.message : String(error),
			},
			tags: ["api", "billing-portal", "error"],
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
