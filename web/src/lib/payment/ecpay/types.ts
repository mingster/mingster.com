export interface EcpayCredentials {
	merchantId: string;
	hashKey: string;
	hashIV: string;
}

/** Fields posted to the ECPay AIO gateway (subset we set). */
export interface EcpayAioInput {
	MerchantTradeNo: string; // <= 20 chars, alphanumeric
	MerchantTradeDate: string; // "yyyy/MM/dd HH:mm:ss"
	TotalAmount: number; // integer TWD
	TradeDesc: string;
	ItemName: string;
	ReturnURL: string; // server-to-server notify
	OrderResultURL?: string; // browser redirect (POST) after pay
	ClientBackURL?: string;
	ChoosePayment: string; // "ALL" | "Credit" | "WebATM" | wallet codes
	[key: string]: string | number | undefined;
}

export type EcpayAioFormPayload = Record<string, string>;

/** Parsed + verified ECPay callback result. */
export interface EcpayCallbackResult {
	MerchantID: string;
	MerchantTradeNo: string;
	TradeNo: string;
	RtnCode: string; // "1" = success
	TradeAmt: string;
	PaymentType?: string;
	[key: string]: string | undefined;
}
