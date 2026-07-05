import {
	resolvePaymentMethodAvailableCountries,
	resolveShippingMethodAvailableCountries,
} from "@/lib/install/method-country-catalog";

/** ISO alpha-3 → alpha-2 for platform-supported countries. */
const ALPHA3_TO_ALPHA2: Record<string, string> = {
	TWN: "TW",
	USA: "US",
	JPN: "JP",
	THA: "TH",
};

/** Countries offered in store admin / wizard (matches `country_iso.json`). */
export const PLATFORM_COUNTRY_ALPHA2 = ["TW", "US", "JP", "TH"] as const;

const NON_ISO_COUNTRY_CODES = new Set(["LOCAL", "DEV"]);

function isPlatformCountryAlpha2(code: string): boolean {
	return (PLATFORM_COUNTRY_ALPHA2 as readonly string[]).includes(code);
}

/** Normalize a country code to ISO alpha-2 for comparisons. Invalid/dev codes → TW. */
export function normalizeCountryCodeToAlpha2(code: string): string {
	const upper = code.trim().toUpperCase();
	if (!upper || NON_ISO_COUNTRY_CODES.has(upper)) {
		return "TW";
	}
	if (upper.length === 2) {
		return isPlatformCountryAlpha2(upper) ? upper : "TW";
	}
	if (upper.length === 3) {
		const mapped = ALPHA3_TO_ALPHA2[upper];
		return mapped && isPlatformCountryAlpha2(mapped) ? mapped : "TW";
	}
	return "TW";
}

/**
 * Effective supported countries for payment/shipping filters.
 * Falls back to defaultCountry, then TW — matches locales tab display behavior.
 * Always includes defaultCountry when set so form selects stay consistent.
 */
export function resolveStoreSupportedCountries(store: {
	supportedCountries?: string[] | null;
	defaultCountry?: string | null;
}): string[] {
	const defaultNormalized = store.defaultCountry?.trim()
		? normalizeCountryCodeToAlpha2(store.defaultCountry)
		: null;

	if (store.supportedCountries?.length) {
		const fromList = [
			...new Set(
				store.supportedCountries
					.map(normalizeCountryCodeToAlpha2)
					.filter(isPlatformCountryAlpha2),
			),
		];
		if (fromList.length === 0) {
			return defaultNormalized && isPlatformCountryAlpha2(defaultNormalized)
				? [defaultNormalized]
				: ["TW"];
		}
		if (defaultNormalized && !fromList.includes(defaultNormalized)) {
			return [...fromList, defaultNormalized];
		}
		return fromList;
	}
	if (defaultNormalized) {
		return [defaultNormalized];
	}
	return ["TW"];
}

/** Resolve store default country as ISO alpha-2 for forms and selects. */
export function resolveDefaultCountryAlpha2(store: {
	defaultCountry?: string | null;
	supportedCountries?: string[] | null;
}): string {
	const supported = resolveStoreSupportedCountries(store);
	const normalized = store.defaultCountry?.trim()
		? normalizeCountryCodeToAlpha2(store.defaultCountry)
		: "";
	if (normalized && supported.includes(normalized)) {
		return normalized;
	}
	return supported[0] ?? "TW";
}

/** Normalize supported/default country fields for locale settings forms. */
export function normalizeStoreCountryFormValues(input: {
	supportedCountries: string[];
	defaultCountry: string;
}): { supportedCountries: string[]; defaultCountry: string } {
	const supportedCountries = [
		...new Set(input.supportedCountries.map(normalizeCountryCodeToAlpha2)),
	];
	const defaultCountry = normalizeCountryCodeToAlpha2(input.defaultCountry);
	const withDefault =
		defaultCountry && !supportedCountries.includes(defaultCountry)
			? [...supportedCountries, defaultCountry]
			: supportedCountries;
	const resolvedSupported = withDefault.length > 0 ? withDefault : ["TW"];
	const resolvedDefault = resolvedSupported.includes(defaultCountry)
		? defaultCountry
		: (resolvedSupported[0] ?? "TW");
	return {
		supportedCountries: resolvedSupported,
		defaultCountry: resolvedDefault,
	};
}

/**
 * A method is offered only when at least one of its availableCountries (ISO
 * alpha-2) is among the store's supportedCountries. Empty availableCountries =
 * available nowhere ("must be listed explicitly").
 */
export function methodAvailableInCountries(
	availableCountries: string[],
	supportedCountries: string[],
): boolean {
	if (availableCountries.length === 0) return false;
	const normalizedSupported = new Set(
		supportedCountries.map(normalizeCountryCodeToAlpha2),
	);
	return availableCountries.some((c) =>
		normalizedSupported.has(normalizeCountryCodeToAlpha2(c)),
	);
}

export function paymentMethodAvailableForStore(
	paymentMethod: {
		name: string;
		payUrl: string;
		availableCountries?: string[] | null;
	},
	store: {
		supportedCountries?: string[] | null;
		defaultCountry?: string | null;
	},
): boolean {
	return methodAvailableInCountries(
		resolvePaymentMethodAvailableCountries(paymentMethod),
		resolveStoreSupportedCountries(store),
	);
}

export function shippingMethodAvailableForStore(
	shippingMethod: {
		name: string;
		identifier?: string | null;
		availableCountries?: string[] | null;
	},
	store: {
		supportedCountries?: string[] | null;
		defaultCountry?: string | null;
	},
): boolean {
	return methodAvailableInCountries(
		resolveShippingMethodAvailableCountries(shippingMethod),
		resolveStoreSupportedCountries(store),
	);
}
