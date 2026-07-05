/** FAQ / FAQ category locale row with a locale id key. */
export interface FaqLocaleRow {
	localeId: string;
}

export interface FaqContentLocaleRow extends FaqLocaleRow {
	question: string;
	answer: string;
}

export interface FaqCategoryNameLocaleRow extends FaqLocaleRow {
	name: string;
}

function localeMatchesLng(localeId: string, lng: string): boolean {
	const lower = localeId.toLowerCase();
	const lowerLng = lng.toLowerCase();
	// exact: "tw" === "tw"
	// prefix: "tw-TW".startsWith("tw-")
	// suffix: "ZH-TW" → "zh-tw".endsWith("-tw")  (Traditional Chinese stored as ZH-TW)
	return (
		lower === lowerLng ||
		lower.startsWith(`${lowerLng}-`) ||
		lower.endsWith(`-${lowerLng}`)
	);
}

/**
 * Pick the best locale row for the active UI language, then fall back to the first row.
 */
export function pickFaqLocaleRow<T extends FaqLocaleRow>(
	locales: T[] | null | undefined,
	lng: string,
): T | undefined {
	if (!locales?.length) return undefined;
	return (
		locales.find((row) => localeMatchesLng(row.localeId, lng)) ?? locales[0]
	);
}

export function getFaqQuestion(
	locales: FaqContentLocaleRow[] | null | undefined,
	lng: string,
): string {
	return pickFaqLocaleRow(locales, lng)?.question ?? "";
}

export function getFaqAnswer(
	locales: FaqContentLocaleRow[] | null | undefined,
	lng: string,
): string {
	return pickFaqLocaleRow(locales, lng)?.answer ?? "";
}

export function getFaqCategoryName(
	locales: FaqCategoryNameLocaleRow[] | null | undefined,
	lng: string,
): string {
	return pickFaqLocaleRow(locales, lng)?.name ?? "";
}
