import logger from "@/lib/logger";
import { cancelPlatformStoreBillingAtStripe } from "@/lib/payment/stripe/cancel-platform-store-billing";
import {
	deleteProductImageFromS3,
	isProductImagesS3Configured,
} from "@/lib/product-images/s3-storage";
import { sqlClient } from "@/lib/prismadb";
import { SafeError } from "@/utils/error";

async function tryDeleteStoreLogoFromS3(
	logoPublicId: string | null,
): Promise<void> {
	if (!isProductImagesS3Configured() || !logoPublicId) {
		return;
	}
	try {
		await deleteProductImageFromS3(logoPublicId);
	} catch (err: unknown) {
		logger.warn("Store logo S3 delete failed during purge", {
			metadata: {
				key: logoPublicId,
				error: err instanceof Error ? err.message : String(err),
			},
			tags: ["sysAdmin", "store", "hard-delete", "s3"],
		});
	}
}

/**
 * Permanently removes a store and related rows from the database.
 * Caller must enforce authorization and business rules (e.g. archived-only).
 */
export async function purgeStoreFromDatabase(storeId: string): Promise<void> {
	const store = await sqlClient.store.findUnique({
		where: { id: storeId },
		select: { id: true, logoPublicId: true },
	});

	if (!store) {
		throw new SafeError("Store not found.");
	}

	const subscription = await sqlClient.storeSubscription.findUnique({
		where: { storeId },
		select: { subscriptionId: true },
	});

	if (subscription?.subscriptionId) {
		await cancelPlatformStoreBillingAtStripe(subscription.subscriptionId);
	}

	await sqlClient.$transaction(
		async (tx) => {
			await tx.storeOrder.deleteMany({ where: { storeId } });

			await tx.subscriptionPayment.deleteMany({ where: { storeId } });
			await tx.storeSubscription.deleteMany({ where: { storeId } });

			await tx.storeShipMethodMapping.deleteMany({ where: { storeId } });
			await tx.storePaymentMethodMapping.deleteMany({ where: { storeId } });

			// Use store.delete (not deleteMany): relationMode = "prisma" batches singular
			// cascades incorrectly across multiple rows.
			await tx.store.delete({ where: { id: storeId } });
		},
		{ maxWait: 10_000, timeout: 120_000 },
	);

	await tryDeleteStoreLogoFromS3(store.logoPublicId);
}
