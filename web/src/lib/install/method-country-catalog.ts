import paymentMethodsInstall from "../../../public/install/payment_methods.json";
import shippingMethodsInstall from "../../../public/install/shipping_methods.json";

const ALPHA3_TO_ALPHA2: Record<string, string> = {
	TWN: "TW",
	USA: "US",
	JPN: "JP",
	THA: "TH",
};

function normalizeCountryCodeToAlpha2(code: string): string {
	const upper = code.trim().toUpperCase();
	if (upper.length === 2) return upper;
	if (upper.length === 3) return ALPHA3_TO_ALPHA2[upper] ?? upper;
	return upper;
}

type InstallPaymentRow = {
	name: string;
	payUrl?: string;
	availableCountries?: string[];
};

type InstallShippingRow = {
	name: string;
	identifier?: string;
	availableCountries?: string[];
};

function normalizePayUrl(payUrl: string): string {
	return payUrl.trim().toLowerCase();
}

function countriesFromInstall(
	rows: Array<{ availableCountries?: string[] }>,
): string[] {
	const codes = rows.flatMap((row) => row.availableCountries ?? []);
	return [...new Set(codes.map(normalizeCountryCodeToAlpha2))];
}

const paymentByPayUrl = new Map<string, string[]>();
const paymentByName = new Map<string, string[]>();

for (const row of paymentMethodsInstall as InstallPaymentRow[]) {
	const countries = countriesFromInstall([row]);
	if (row.payUrl) {
		paymentByPayUrl.set(normalizePayUrl(row.payUrl), countries);
	}
	paymentByName.set(row.name, countries);
}

const shippingByIdentifier = new Map<string, string[]>();
const shippingByName = new Map<string, string[]>();

for (const row of shippingMethodsInstall as InstallShippingRow[]) {
	const countries = countriesFromInstall([row]);
	if (row.identifier?.trim()) {
		shippingByIdentifier.set(row.identifier.trim(), countries);
	}
	shippingByName.set(row.name, countries);
}

/**
 * Effective ISO alpha-2 countries for a payment method.
 * DB value wins; empty DB arrays fall back to public/install/payment_methods.json
 * (legacy rows created before availableCountries was populated).
 */
export function resolvePaymentMethodAvailableCountries(method: {
	name: string;
	payUrl: string;
	availableCountries?: string[] | null;
}): string[] {
	if (method.availableCountries?.length) {
		return method.availableCountries.map(normalizeCountryCodeToAlpha2);
	}
	const fromInstall =
		paymentByPayUrl.get(normalizePayUrl(method.payUrl)) ??
		paymentByName.get(method.name);
	return fromInstall ?? [];
}

/**
 * Effective ISO alpha-2 countries for a shipping method.
 * DB value wins; empty DB arrays fall back to public/install/shipping_methods.json.
 */
export function resolveShippingMethodAvailableCountries(method: {
	name: string;
	identifier?: string | null;
	availableCountries?: string[] | null;
}): string[] {
	if (method.availableCountries?.length) {
		return method.availableCountries.map(normalizeCountryCodeToAlpha2);
	}
	const identifier = method.identifier?.trim();
	const fromInstall =
		(identifier ? shippingByIdentifier.get(identifier) : undefined) ??
		shippingByName.get(method.name);
	return fromInstall ?? [];
}
