import type { PaymentMethod, StoreOrder } from "@prisma/client";

import "@/lib/payment/plugins";
import {
	expandRegisteredPluginPayUrls,
	getPaymentPlugin,
	paymentPluginRegistry,
} from "@/lib/payment/plugins/registry";
import type {
	PaymentMethodPlugin,
	PluginConfig,
} from "@/lib/payment/plugins/types";
import { synchronizePaymentMethodCatalogFromPlugins } from "@/lib/payment/plugins/loader";
import { sqlClient } from "@/lib/prismadb";
import { normalizePayUrl } from "@/lib/payment/normalize-pay-url";
import {
	paymentMethodAvailableForStore,
	resolveStoreSupportedCountries,
} from "@/utils/method-country-utils";

export { normalizePayUrl };

export type ResolveShopCheckoutPaymentErrorCode =
	| "UNKNOWN_METHOD"
	| "PLATFORM_DISABLED"
	| "PLUGIN_NOT_REGISTERED"
	| "STORE_NOT_ALLOWED"
	| "NOT_VISIBLE_TO_CUSTOMER";

export type ResolveShopCheckoutPaymentResult =
	| {
			ok: true;
			paymentMethod: PaymentMethod;
			plugin: PaymentMethodPlugin;
	  }
	| {
			ok: false;
			code: ResolveShopCheckoutPaymentErrorCode;
			message: string;
	  };

/**
 * Whether the store may use this payment method row, matching {@link get-store} /
 * {@link getStoreForOrderEdit}: empty mappings ⇒ all `isDefault` methods apply;
 * otherwise an explicit mapping is required.
 */
async function storeAllowsPaymentMethod(
	storeId: string,
	methodId: string,
	methodIsDefault: boolean,
): Promise<boolean> {
	const mappingCount = await sqlClient.storePaymentMethodMapping.count({
		where: { storeId },
	});
	if (mappingCount === 0) {
		return methodIsDefault;
	}
	const mapping = await sqlClient.storePaymentMethodMapping.findFirst({
		where: { storeId, methodId },
		select: { id: true },
	});
	return mapping !== null;
}

/**
 * Resolves a shop checkout payment processor: DB catalog + platform flag + plugin
 * registry + store eligibility + customer visibility.
 */
export async function resolveShopCheckoutPayment(
	storeId: string,
	payUrlRaw: string,
): Promise<ResolveShopCheckoutPaymentResult> {
	await synchronizePaymentMethodCatalogFromPlugins();

	const payUrl = normalizePayUrl(payUrlRaw);
	if (!payUrl) {
		return {
			ok: false,
			code: "UNKNOWN_METHOD",
			message: "Payment method is required.",
		};
	}

	const paymentMethod = await sqlClient.paymentMethod.findFirst({
		where: {
			payUrl: { equals: payUrl, mode: "insensitive" },
			isDeleted: false,
		},
		orderBy: { name: "asc" },
	});

	if (!paymentMethod) {
		return {
			ok: false,
			code: "UNKNOWN_METHOD",
			message: "This payment method is not available.",
		};
	}

	if (!paymentMethod.platformEnabled) {
		return {
			ok: false,
			code: "PLATFORM_DISABLED",
			message: "This payment processor is disabled by the platform.",
		};
	}

	const plugin = getPaymentPlugin(payUrl);
	if (!plugin) {
		return {
			ok: false,
			code: "PLUGIN_NOT_REGISTERED",
			message: "This payment processor is not installed.",
		};
	}

	if (!paymentMethod.visibleToCustomer) {
		return {
			ok: false,
			code: "NOT_VISIBLE_TO_CUSTOMER",
			message: "This payment method is not available for checkout.",
		};
	}

	const allowed = await storeAllowsPaymentMethod(
		storeId,
		paymentMethod.id,
		paymentMethod.isDefault,
	);
	if (!allowed) {
		return {
			ok: false,
			code: "STORE_NOT_ALLOWED",
			message: "This store does not accept this payment method.",
		};
	}

	const store = await sqlClient.store.findFirst({
		where: { id: storeId, isDeleted: false },
		select: { supportedCountries: true, defaultCountry: true },
	});
	if (
		!store ||
		!paymentMethodAvailableForStore(paymentMethod, {
			supportedCountries: store.supportedCountries?.length
				? store.supportedCountries
				: resolveStoreSupportedCountries(store),
			defaultCountry: store.defaultCountry,
		})
	) {
		return {
			ok: false,
			code: "STORE_NOT_ALLOWED",
			message: "This payment method is not available in your country.",
		};
	}

	return { ok: true, paymentMethod, plugin };
}

export interface ShopCheckoutPaymentOption {
	payUrl: string;
	name: string;
}

/** Optional context so plugins can hide methods that need auth or credentials (e.g. credit). */
export interface ListShopCheckoutPaymentMethodRowsContext {
	/** Order owner / signed-in user on checkout (omit or null for guests). */
	checkoutUserId?: string | null;
}

async function paymentMethodIsConfiguredForCheckout(
	plugin: PaymentMethodPlugin,
	storeId: string,
	checkoutUserId: string | null | undefined,
): Promise<boolean> {
	const stubOrder = {
		storeId,
		userId: checkoutUserId ?? null,
	} as StoreOrder;
	const config: PluginConfig = { storeId };
	const availability = await Promise.resolve(
		plugin.checkAvailability(stubOrder, config),
	);
	return availability.available !== false;
}

export type ShopCheckoutPaymentMethodRow = PaymentMethod & {
	/** True when the payment method is enabled by the store but missing required credentials. */
	disabled: boolean;
};

/**
 * Payment methods the storefront may offer for D2C checkout (subject to env / LINE Pay config).
 * Methods with incomplete credentials are included but marked `disabled: true`.
 */
export async function listShopCheckoutPaymentMethodRows(
	storeId: string,
	context?: ListShopCheckoutPaymentMethodRowsContext,
): Promise<ShopCheckoutPaymentMethodRow[]> {
	await synchronizePaymentMethodCatalogFromPlugins();

	const store = await sqlClient.store.findFirst({
		where: { id: storeId, isDeleted: false },
		select: {
			id: true,
			level: true,
			supportedCountries: true,
			defaultCountry: true,
		},
	});
	if (!store) {
		return [];
	}

	const storeCountryContext = {
		supportedCountries: store.supportedCountries?.length
			? store.supportedCountries
			: resolveStoreSupportedCountries(store),
		defaultCountry: store.defaultCountry,
	};

	const pluginPayUrls = expandRegisteredPluginPayUrls(
		paymentPluginRegistry.getIdentifiers(),
	);

	const candidates = await sqlClient.paymentMethod.findMany({
		where: {
			isDeleted: false,
			platformEnabled: true,
			visibleToCustomer: true,
			payUrl: { in: pluginPayUrls },
		},
	});

	const out: ShopCheckoutPaymentMethodRow[] = [];
	for (const pm of candidates) {
		const payUrl = normalizePayUrl(pm.payUrl);
		const plugin = getPaymentPlugin(payUrl);
		if (!plugin) {
			continue;
		}
		const allowed = await storeAllowsPaymentMethod(
			storeId,
			pm.id,
			pm.isDefault,
		);
		if (!allowed) {
			continue;
		}
		if (!paymentMethodAvailableForStore(pm, storeCountryContext)) {
			continue;
		}
		const configured = await paymentMethodIsConfiguredForCheckout(
			plugin,
			storeId,
			context?.checkoutUserId,
		);
		out.push({ ...pm, disabled: !configured });
	}

	return out;
}
