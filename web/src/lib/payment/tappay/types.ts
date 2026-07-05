export interface TapPayCredentials {
	appId: string;
	appKey: string; // public app key (app_xxx) — client SDK setup
	partnerKey: string; // SECRET partner key (partner_xxx) — server Pay-by-Prime
	merchantId: string;
}

export interface TapPayPayByPrimeInput {
	prime: string;
	amount: number; // integer TWD
	orderNumber: string;
	details: string;
	cardholder: {
		name: string;
		email: string;
		phoneNumber?: string;
	};
}

export interface TapPayPayByPrimeResult {
	status: number; // 0 = success
	msg: string;
	rec_trade_id?: string;
	bank_transaction_id?: string;
}
