import { pickFaqLocaleRow } from "@/utils/faq-locale-utils";

export type ProductLocaleNameRow = {
	localeId: string;
	name: string;
};

type ProductNameSource = {
	name: string;
	locales?: ProductLocaleNameRow[] | null;
};

function pickLocalizedProductName(
	product: ProductNameSource,
	localeId: string,
): string | undefined {
	const match = pickFaqLocaleRow(product.locales, localeId)?.name?.trim();
	return match || undefined;
}

/** Storefront: active UI language, then store default locale, then scalar `name`. */
export function getProductDisplayNameForLng(
	product: ProductNameSource,
	lng: string,
	storeDefaultLocale?: string,
): string {
	if (product.locales?.length) {
		const activeName = pickLocalizedProductName(product, lng);
		if (activeName) {
			return activeName;
		}
		if (storeDefaultLocale && storeDefaultLocale !== lng) {
			const storeName = pickLocalizedProductName(product, storeDefaultLocale);
			if (storeName) {
				return storeName;
			}
		}
	}
	return product.name;
}
