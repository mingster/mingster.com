import { normalizeCountryCodeToAlpha2 } from "@/utils/method-country-utils";
import { z } from "zod";

/** ISO alpha-2 codes where this payment/shipping method may be offered. */
export const availableCountriesSchema = z
	.array(z.string().min(2, "Country code is required"))
	.min(1, "Select at least one available country");

export function normalizeAvailableCountryCodes(codes: string[]): string[] {
	const normalized = codes
		.map(normalizeCountryCodeToAlpha2)
		.filter((code) => code.length === 2);
	return [...new Set(normalized)];
}
