import type Stripe from "stripe";
import { sqlClient } from "@/lib/prismadb";
import { stripe } from "@/lib/stripe/config";
import type { User } from "@/types";
import { SafeError } from "@/utils/error";
import logger from "@/lib/logger";

export const ensureStripeCustomer = async (
	userId: string,
): Promise<Stripe.Customer | null> => {
	const user = await sqlClient.user.findUnique({
		where: { id: userId },
	});

	if (!user) throw new SafeError("Unauthorized");

	if (!user.stripeCustomerId) {
		return await doCreateStripeCustomer(user);
	} else {
		return await doValidateStripeCustomer(user);
	}
};

async function doCreateStripeCustomer(
	user: User,
): Promise<Stripe.Customer | null> {
	return await stripe.customers
		.create({
			email: user.email,
			name: user.name,
		})
		.then(async (customer) => {
			await sqlClient.user.update({
				where: { id: user.id },
				data: {
					stripeCustomerId: customer.id,
				},
			});

			return customer as Stripe.Customer;
		});
}

async function doValidateStripeCustomer(
	user: User,
): Promise<Stripe.Customer | null> {
	try {
		const _stripeCustomer = await stripe.customers.retrieve(
			user.stripeCustomerId,
		);

		return _stripeCustomer as Stripe.Customer;
	} catch (error) {
		logger.error({ error: error });
		//if stripe customer does not exist, create it
		return await doCreateStripeCustomer(user);
	}
}
