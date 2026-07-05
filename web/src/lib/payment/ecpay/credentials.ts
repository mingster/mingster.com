import { parsePaymentCredentials } from "@/lib/payment/payment-credentials";
import { sqlClient } from "@/lib/prismadb";
import type { EcpayCredentials } from "./types";

function trimCredentials(input: {
	merchantId?: string | null;
	hashKey?: string | null;
	hashIV?: string | null;
}): EcpayCredentials | null {
	const merchantId = input.merchantId?.trim() ?? "";
	const hashKey = input.hashKey?.trim() ?? "";
	const hashIV = input.hashIV?.trim() ?? "";
	if (!merchantId || !hashKey || !hashIV) return null;
	return { merchantId, hashKey, hashIV };
}

export function getPlatformEcpayCredentials(): EcpayCredentials | null {
	return trimCredentials({
		merchantId: process.env.ECPAY_MERCHANT_ID,
		hashKey: process.env.ECPAY_HASH_KEY,
		hashIV: process.env.ECPAY_HASH_IV,
	});
}

/** Store-level ECPay credentials from store admin, with platform env fallback. */
export async function getEcpayCredentialsByStore(
	storeId: string,
	store?: { paymentCredentials: unknown } | null,
): Promise<EcpayCredentials | null> {
	let raw: unknown = store?.paymentCredentials;
	if (raw === undefined) {
		const row = await sqlClient.store.findUnique({
			where: { id: storeId },
			select: { paymentCredentials: true },
		});
		raw = row?.paymentCredentials;
	}

	const parsed = parsePaymentCredentials(raw);
	const storeCredentials = trimCredentials({
		merchantId: parsed.ecpay?.merchantId,
		hashKey: parsed.ecpay?.hashKey,
		hashIV: parsed.ecpay?.hashIV,
	});
	if (storeCredentials) {
		return storeCredentials;
	}

	return getPlatformEcpayCredentials();
}
