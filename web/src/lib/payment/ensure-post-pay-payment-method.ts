import type { PaymentMethod, PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { sqlClient } from "@/lib/prismadb";
import { getUtcNowEpoch } from "@/utils/datetime-utils";

/** Hidden system method for post-pay orders (`requirePrepaid = false`). */
export const POST_PAY_PAYMENT_METHOD_NAME = "TBD";
export const POST_PAY_PAYMENT_PAY_URL = "TBD";

type PaymentMethodDb = Pick<PrismaClient, "paymentMethod">;

/**
 * Ensures the hidden post-pay payment method exists (payUrl `TBD`).
 * Used when customers place orders before choosing how to pay at the counter.
 */
export async function ensurePostPayPaymentMethod(
	client: PaymentMethodDb = sqlClient,
): Promise<PaymentMethod> {
	const now = getUtcNowEpoch();
	const fields = {
		payUrl: POST_PAY_PAYMENT_PAY_URL,
		priceDescr: "Post-pay; payment method selected when settling the order",
		fee: new Prisma.Decimal(0),
		feeAdditional: new Prisma.Decimal(0),
		clearDays: 0,
		isDeleted: false,
		isDefault: false,
		canDelete: false,
		visibleToCustomer: false,
		platformEnabled: true,
		availableCountries: [] as string[],
		updatedAt: now,
	};

	const byPayUrl = await client.paymentMethod.findFirst({
		where: {
			payUrl: POST_PAY_PAYMENT_PAY_URL,
			isDeleted: false,
		},
	});

	if (byPayUrl) {
		return client.paymentMethod.update({
			where: { id: byPayUrl.id },
			data: fields,
		});
	}

	return client.paymentMethod.upsert({
		where: { name: POST_PAY_PAYMENT_METHOD_NAME },
		create: {
			name: POST_PAY_PAYMENT_METHOD_NAME,
			...fields,
			createdAt: now,
		},
		update: fields,
	});
}
