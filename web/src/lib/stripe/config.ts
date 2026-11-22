import Stripe from "stripe";

let client: Stripe | undefined;

function createStripe(): Stripe {
	return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
		// https://github.com/stripe/stripe-node#configuration
		// https://stripe.com/docs/api/versioning
		apiVersion: "2026-02-25.clover",
		typescript: true,

		// Register this as an official Stripe plugin.
		// https://stripe.com/docs/building-plugins#setappinfo
		appInfo: {
			name: "Next.js Subscription Starter",
			version: "0.0.0",
			url: "https://github.com/vercel/nextjs-subscription-payments",
		},
	});
}

/**
 * Stripe client, created on first use. Importing this module must not throw
 * when STRIPE_SECRET_KEY is missing (for example `install:data --skip-stripe`).
 * Using the client without the key still throws, as before.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
	get(_target, prop) {
		client ??= createStripe();
		return Reflect.get(client, prop, client);
	},
	has(_target, prop) {
		client ??= createStripe();
		return Reflect.has(client, prop);
	},
});
