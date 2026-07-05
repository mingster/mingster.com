"use client";

import { createContext, useCallback, useContext } from "react";
import { useI18n } from "@/providers/i18n-provider";
import {
	getProductDisplayNameForLng,
	type ProductLocaleNameRow,
} from "./product-locale-display";

type ProductNameSource = {
	name: string;
	locales?: ProductLocaleNameRow[] | null;
};

/**
 * Store default locale, supplied once per store layout. Lets product-name
 * resolution fall back to the store default for anonymous visitors whose active
 * UI language has no matching locale row. `undefined` outside a store layout
 * (e.g. account pages), where signed-in `lng` already mirrors `user.locale`.
 */
const StoreDefaultLocaleContext = createContext<string | undefined>(undefined);

export function StoreDefaultLocaleProvider({
	value,
	children,
}: {
	value?: string | null;
	children: React.ReactNode;
}) {
	return (
		<StoreDefaultLocaleContext.Provider value={value ?? undefined}>
			{children}
		</StoreDefaultLocaleContext.Provider>
	);
}

export function useStoreDefaultLocale(): string | undefined {
	return useContext(StoreDefaultLocaleContext);
}

/**
 * Returns a localizer for product display names. Resolution chain:
 * active UI language (`lng`) → store default locale → scalar `name`.
 *
 * Signed-in users: `lng` already mirrors `user.locale` (synced on save).
 * Anonymous users: the store default (from `StoreDefaultLocaleProvider`)
 * provides the correct fallback when the active language has no locale row.
 *
 * @param storeDefaultLocaleOverride optional explicit store default; defaults
 *   to the value from `StoreDefaultLocaleProvider`.
 */
export function useProductName(
	storeDefaultLocaleOverride?: string | null,
): (product: ProductNameSource) => string {
	const { lng } = useI18n();
	const contextDefault = useStoreDefaultLocale();
	const storeDefault = storeDefaultLocaleOverride ?? contextDefault;

	return useCallback(
		(product: ProductNameSource) =>
			getProductDisplayNameForLng(product, lng, storeDefault ?? undefined),
		[lng, storeDefault],
	);
}
