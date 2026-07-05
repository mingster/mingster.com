import "@/lib/payment/plugins";
import {
	expandRegisteredPluginPayUrls,
	paymentPluginRegistry,
} from "@/lib/payment/plugins/registry";

/** payUrl values for methods a store may assign (includes ECPay wallet aliases). */
export function getRegisteredStorePaymentPayUrls(): string[] {
	return expandRegisteredPluginPayUrls(paymentPluginRegistry.getIdentifiers());
}

/** Prisma where clause for platform payment methods shown in store admin pickers. */
export function buildListedStorePaymentMethodWhere() {
	return {
		isDeleted: false,
		platformEnabled: true,
		visibleToCustomer: true,
		payUrl: { in: getRegisteredStorePaymentPayUrls() },
	} as const;
}

/** Prisma where clause for validating store payment method assignments. */
export function buildApprovedStorePaymentMethodWhere(methodIds: string[]) {
	return {
		id: { in: methodIds },
		isDeleted: false,
		platformEnabled: true,
		visibleToCustomer: true,
		payUrl: { in: getRegisteredStorePaymentPayUrls() },
	} as const;
}
