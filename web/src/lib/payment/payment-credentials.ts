export interface StorePaymentCredentials {
	linepay?: { id?: string; secret?: string };
	stripe?: { secretKey?: string };
	paypal?: { clientId?: string; clientSecret?: string };
	newebpay?: { merchantId?: string; hashKey?: string; hashIV?: string };
	ecpay?: { merchantId?: string; hashKey?: string; hashIV?: string };
	tappay?: {
		appId?: string;
		appKey?: string;
		partnerKey?: string;
		merchantId?: string;
	};
}

export interface StorePaymentCredentialsInput {
	linepay?: { id?: string | null; secret?: string | null };
	stripe?: { secretKey?: string | null };
	paypal?: { clientId?: string | null; clientSecret?: string | null };
	newebpay?: {
		merchantId?: string | null;
		hashKey?: string | null;
		hashIV?: string | null;
	};
	ecpay?: {
		merchantId?: string | null;
		hashKey?: string | null;
		hashIV?: string | null;
	};
	tappay?: {
		appId?: string | null;
		appKey?: string | null;
		partnerKey?: string | null;
		merchantId?: string | null;
	};
}

export function parsePaymentCredentials(raw: unknown): StorePaymentCredentials {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
	return raw as StorePaymentCredentials;
}

function mergeCredentialValue(
	incoming: string | null | undefined,
	existing: string | undefined,
): string {
	const trimmed = typeof incoming === "string" ? incoming.trim() : "";
	return trimmed.length > 0 ? trimmed : (existing ?? "");
}

export function mergePaymentCredentials(
	existing: StorePaymentCredentials,
	incoming: StorePaymentCredentialsInput,
): StorePaymentCredentials {
	return {
		linepay: {
			id: mergeCredentialValue(incoming.linepay?.id, existing.linepay?.id),
			secret: mergeCredentialValue(
				incoming.linepay?.secret,
				existing.linepay?.secret,
			),
		},
		stripe: {
			secretKey: mergeCredentialValue(
				incoming.stripe?.secretKey,
				existing.stripe?.secretKey,
			),
		},
		paypal: {
			clientId: mergeCredentialValue(
				incoming.paypal?.clientId,
				existing.paypal?.clientId,
			),
			clientSecret: mergeCredentialValue(
				incoming.paypal?.clientSecret,
				existing.paypal?.clientSecret,
			),
		},
		newebpay: {
			merchantId: mergeCredentialValue(
				incoming.newebpay?.merchantId,
				existing.newebpay?.merchantId,
			),
			hashKey: mergeCredentialValue(
				incoming.newebpay?.hashKey,
				existing.newebpay?.hashKey,
			),
			hashIV: mergeCredentialValue(
				incoming.newebpay?.hashIV,
				existing.newebpay?.hashIV,
			),
		},
		ecpay: {
			merchantId: mergeCredentialValue(
				incoming.ecpay?.merchantId,
				existing.ecpay?.merchantId,
			),
			hashKey: mergeCredentialValue(
				incoming.ecpay?.hashKey,
				existing.ecpay?.hashKey,
			),
			hashIV: mergeCredentialValue(
				incoming.ecpay?.hashIV,
				existing.ecpay?.hashIV,
			),
		},
		tappay: {
			appId: mergeCredentialValue(
				incoming.tappay?.appId,
				existing.tappay?.appId,
			),
			appKey: mergeCredentialValue(
				incoming.tappay?.appKey,
				existing.tappay?.appKey,
			),
			partnerKey: mergeCredentialValue(
				incoming.tappay?.partnerKey,
				existing.tappay?.partnerKey,
			),
			merchantId: mergeCredentialValue(
				incoming.tappay?.merchantId,
				existing.tappay?.merchantId,
			),
		},
	};
}
