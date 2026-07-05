import { parsePaymentCredentials } from "@/lib/payment/payment-credentials";
import { sqlClient } from "@/lib/prismadb";
import type { TapPayCredentials } from "./types";

function trimCredentials(input: {
	appId?: string | null;
	appKey?: string | null;
	partnerKey?: string | null;
	merchantId?: string | null;
}): TapPayCredentials | null {
	const appId = input.appId?.trim() ?? "";
	const appKey = input.appKey?.trim() ?? "";
	const partnerKey = input.partnerKey?.trim() ?? "";
	const merchantId = input.merchantId?.trim() ?? "";
	if (!appId || !appKey || !partnerKey || !merchantId) return null;
	return { appId, appKey, partnerKey, merchantId };
}

/** Store-level TapPay credentials from store admin paid-options settings only. */
export async function getTapPayCredentialsByStore(
	storeId: string,
	store?: { paymentCredentials: unknown } | null,
): Promise<TapPayCredentials | null> {
	let raw: unknown = store?.paymentCredentials;
	if (raw === undefined) {
		const row = await sqlClient.store.findUnique({
			where: { id: storeId },
			select: { paymentCredentials: true },
		});
		raw = row?.paymentCredentials;
	}
	const parsed = parsePaymentCredentials(raw);
	return trimCredentials({
		appId: parsed.tappay?.appId,
		appKey: parsed.tappay?.appKey,
		partnerKey: parsed.tappay?.partnerKey,
		merchantId: parsed.tappay?.merchantId,
	});
}
