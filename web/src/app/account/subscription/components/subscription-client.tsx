"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import { toastError, toastSuccess } from "@/components/toaster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SubscriptionData {
	id: string;
	plan: string;
	status: string;
	periodStart: string | null;
	periodEnd: string | null;
	cancelAtPeriodEnd: boolean;
	trialStart: string | null;
	trialEnd: string | null;
}

interface SubscriptionClientProps {
	subscription: SubscriptionData | null;
}

function statusVariant(
	status: string,
): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "active":
		case "trialing":
			return "default";
		case "past_due":
			return "destructive";
		case "canceled":
			return "secondary";
		default:
			return "outline";
	}
}

export function SubscriptionClient({ subscription }: SubscriptionClientProps) {
	const router = useRouter();
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const isActive =
		subscription?.status === "active" || subscription?.status === "trialing";

	const handleManageBilling = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/subscribe/billing-portal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					returnUrl: `${window.location.origin}/account/subscription`,
				}),
			});

			const data = (await res.json()) as { url?: string; message?: string };

			if (!res.ok) {
				toastError({
					description: data.message ?? "Failed to open billing portal",
				});
				return;
			}

			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err) {
			toastError({
				description:
					err instanceof Error ? err.message : "Failed to open billing portal",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/subscribe/billing-portal", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					returnUrl: `${window.location.origin}/account/subscription`,
				}),
			});

			const data = (await res.json()) as { url?: string; message?: string };

			if (!res.ok) {
				toastError({
					description: data.message ?? "Failed to open billing portal",
				});
				return;
			}

			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err) {
			toastError({
				description:
					err instanceof Error ? err.message : "Failed to cancel subscription",
			});
		} finally {
			setLoading(false);
			setCancelModalOpen(false);
		}
	};

	if (!subscription) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No Active Subscription</CardTitle>
					<CardDescription>
						You don't have an active subscription yet.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild>
						<Link href="/subscribe">View Plans</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<AlertModal
				isOpen={cancelModalOpen}
				onClose={() => setCancelModalOpen(false)}
				onConfirm={() => void handleCancel()}
				loading={loading}
			/>

			<Card className="border-border/80">
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
					<div className="space-y-1">
						<CardTitle className="text-lg">Current Plan</CardTitle>
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-2xl font-semibold tracking-tight capitalize">
								{subscription.plan}
							</span>
							<Badge variant={statusVariant(subscription.status)}>
								{subscription.status}
							</Badge>
							{subscription.cancelAtPeriodEnd && (
								<Badge variant="destructive">Cancels at period end</Badge>
							)}
						</div>
					</div>
					<Button variant="outline" size="sm" asChild className="shrink-0">
						<Link href="/subscribe">Change Plan</Link>
					</Button>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					{subscription.periodEnd && isActive && (
						<p>
							{subscription.cancelAtPeriodEnd
								? "Access until: "
								: "Renews on: "}
							<span className="font-medium text-foreground">
								{new Date(subscription.periodEnd).toLocaleDateString()}
							</span>
						</p>
					)}
					{subscription.status === "trialing" && subscription.trialEnd && (
						<p>
							Trial ends:{" "}
							<span className="font-medium text-foreground">
								{new Date(subscription.trialEnd).toLocaleDateString()}
							</span>
						</p>
					)}
					{subscription.status === "canceled" && subscription.periodEnd && (
						<p>
							Ended on:{" "}
							<span className="font-medium text-foreground">
								{new Date(subscription.periodEnd).toLocaleDateString()}
							</span>
						</p>
					)}
				</CardContent>
			</Card>

			<Card className="border-border/80">
				<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
					<div>
						<CardTitle className="text-lg">Payment & Billing</CardTitle>
						<CardDescription>
							Update your payment method, view invoices, or cancel your
							subscription.
						</CardDescription>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="shrink-0"
						disabled={loading}
						onClick={() => void handleManageBilling()}
					>
						{loading ? "Loading..." : "Manage Billing"}
					</Button>
				</CardHeader>
			</Card>

			{isActive && !subscription.cancelAtPeriodEnd && (
				<>
					<Separator />
					<Card className="border-destructive/30">
						<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
							<div>
								<CardTitle className="text-lg">Cancel Subscription</CardTitle>
								<CardDescription>
									Cancel via the Stripe billing portal. Your subscription will
									remain active until the end of the current billing period.
								</CardDescription>
							</div>
							<Button
								variant="destructive"
								size="sm"
								className="shrink-0"
								disabled={loading}
								onClick={() => setCancelModalOpen(true)}
							>
								Cancel Plan
							</Button>
						</CardHeader>
					</Card>
				</>
			)}

			{subscription.status === "canceled" && (
				<Card className="border-border/80">
					<CardHeader>
						<CardTitle className="text-lg">Resubscribe</CardTitle>
						<CardDescription>
							Your subscription has ended. Subscribe again to regain access.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href="/subscribe">View Plans</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
