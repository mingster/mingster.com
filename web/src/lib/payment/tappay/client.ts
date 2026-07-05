import logger from "@/lib/logger";
import type {
	TapPayCredentials,
	TapPayPayByPrimeInput,
	TapPayPayByPrimeResult,
} from "./types";

function getPayByPrimeUrl(): string {
	return process.env.NODE_ENV === "production"
		? "https://prod.tappaysdk.com/tpc/payment/pay-by-prime"
		: "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
}

export function buildPayByPrimeRequest(
	input: TapPayPayByPrimeInput,
	credentials: TapPayCredentials,
) {
	return {
		prime: input.prime,
		partner_key: credentials.partnerKey,
		merchant_id: credentials.merchantId,
		amount: input.amount,
		currency: "TWD",
		order_number: input.orderNumber,
		details: input.details,
		cardholder: {
			phone_number: input.cardholder.phoneNumber ?? "",
			name: input.cardholder.name,
			email: input.cardholder.email,
		},
		remember: false,
	};
}

export function isPayByPrimeSuccess(result: { status: number }): boolean {
	return result.status === 0;
}

export async function payByPrime(
	input: TapPayPayByPrimeInput,
	credentials: TapPayCredentials,
): Promise<TapPayPayByPrimeResult> {
	const res = await fetch(getPayByPrimeUrl(), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": credentials.partnerKey,
		},
		body: JSON.stringify(buildPayByPrimeRequest(input, credentials)),
	});
	const data = (await res.json()) as TapPayPayByPrimeResult;
	if (!isPayByPrimeSuccess(data)) {
		logger.error("TapPay pay-by-prime failed", {
			metadata: { status: data.status, msg: data.msg },
			tags: ["payment", "tappay", "error"],
		});
	}
	return data;
}
