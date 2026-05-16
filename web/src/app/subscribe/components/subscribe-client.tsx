"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toastError } from "@/components/toaster";

interface Price {
	id: string;
	nickname: string | null;
	unitAmount: number | null;
	currency: string;
	interval: string | null;
}

interface CurrentSubscription {
	plan: string;
	status: string;
	periodEnd: string | null;
	cancelAtPeriodEnd: boolean;
}

interface SubscribeClientProps {
	prices: Price[];
	productName: string | null;
	currentSubscription: CurrentSubscription | null;
}

function formatPrice(amount: number | null, currency: string): string {
	if (amount == null) return "—";
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: currency.toUpperCase(),
		minimumFractionDigits: 0,
	}).format(amount / 100);
}

export function SubscribeClient({
	prices,
	productName,
	currentSubscription,
}: SubscribeClientProps) {
	const [loading, setLoading] = useState<string | null>(null);

	const monthlyPrices = prices.filter((p) => p.interval === "month");
	const yearlyPrices = prices.filter((p) => p.interval === "year");
	const allPrices = [...monthlyPrices, ...yearlyPrices];

	const isActive =
		currentSubscription?.status === "active" ||
		currentSubscription?.status === "trialing";

	const handleSubscribe = async (stripePriceId: string) => {
		setLoading(stripePriceId);
		try {
			const res = await fetch("/api/subscribe/create-checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ stripePriceId }),
			});

			const data = (await res.json()) as { url?: string; message?: string };

			if (!res.ok) {
				toastError({
					description: data.message ?? "Failed to start checkout",
				});
				return;
			}

			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err) {
			toastError({
				description:
					err instanceof Error ? err.message : "Failed to start checkout",
			});
		} finally {
			setLoading(null);
		}
	};

	if (prices.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">
					No subscription plans available at the moment.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{productName && (
				<div className="text-center">
					<h2 className="text-2xl font-semibold tracking-tight">
						{productName}
					</h2>
					<p className="mt-2 text-muted-foreground">
						Choose a plan that works for you.
					</p>
				</div>
			)}

			{isActive && currentSubscription && (
				<Card className="border-primary/30">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Current Plan</CardTitle>
						<CardDescription>
							<Badge variant="secondary" className="mr-2">
								{currentSubscription.plan}
							</Badge>
							<Badge
								variant={
									currentSubscription.status === "active"
										? "default"
										: "destructive"
								}
							>
								{currentSubscription.status}
							</Badge>
							{currentSubscription.cancelAtPeriodEnd && (
								<span className="ml-2 text-sm text-destructive">
									Cancels at period end
								</span>
							)}
						</CardDescription>
					</CardHeader>
					{currentSubscription.periodEnd && (
						<CardContent className="pt-0">
							<p className="text-sm text-muted-foreground">
								Current period ends:{" "}
								{new Date(currentSubscription.periodEnd).toLocaleDateString()}
							</p>
						</CardContent>
					)}
				</Card>
			)}

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{allPrices.map((price) => {
					const planName = price.nickname ?? price.id;
					const isCurrent = isActive && currentSubscription?.plan === planName;

					return (
						<Card
							key={price.id}
							className={isCurrent ? "ring-2 ring-primary/30" : ""}
						>
							<CardHeader>
								<CardTitle className="text-lg">
									{price.nickname ?? "Plan"}
								</CardTitle>
								<CardDescription>
									<span className="text-2xl font-semibold text-foreground">
										{formatPrice(price.unitAmount, price.currency)}
									</span>
									{price.interval && (
										<span className="text-muted-foreground">
											{" "}
											/ {price.interval}
										</span>
									)}
								</CardDescription>
							</CardHeader>
							<CardFooter>
								<Button
									className="w-full"
									disabled={isCurrent || loading !== null}
									onClick={() => handleSubscribe(price.id)}
								>
									{isCurrent
										? "Current Plan"
										: loading === price.id
											? "Loading..."
											: "Subscribe"}
								</Button>
							</CardFooter>
						</Card>
					);
				})}
			</div>

			{isActive && (
				<>
					<Separator />
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Manage your subscription, update payment method, or cancel from{" "}
							<a
								href="/account/subscription"
								className="underline hover:text-foreground"
							>
								Account Settings
							</a>
							.
						</p>
					</div>
				</>
			)}
		</div>
	);
}
