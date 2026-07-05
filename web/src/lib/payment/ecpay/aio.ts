import { generateCheckMacValue, verifyCheckMacValue } from "./crypto";
import type {
	EcpayAioFormPayload,
	EcpayAioInput,
	EcpayCallbackResult,
	EcpayCredentials,
} from "./types";

export function getEcpayAioGatewayUrl(): string {
	return process.env.NODE_ENV === "production"
		? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
		: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5";
}

export function buildEcpayAioFormPayload(
	input: EcpayAioInput,
	credentials: EcpayCredentials,
): EcpayAioFormPayload {
	const fields: Record<string, string> = {
		MerchantID: credentials.merchantId,
		PaymentType: "aio",
		EncryptType: "1",
		MerchantTradeNo: input.MerchantTradeNo,
		MerchantTradeDate: input.MerchantTradeDate,
		TotalAmount: String(input.TotalAmount),
		TradeDesc: input.TradeDesc,
		ItemName: input.ItemName,
		ReturnURL: input.ReturnURL,
		ChoosePayment: input.ChoosePayment,
	};
	if (input.OrderResultURL) fields.OrderResultURL = input.OrderResultURL;
	if (input.ClientBackURL) fields.ClientBackURL = input.ClientBackURL;

	fields.CheckMacValue = generateCheckMacValue(fields, credentials);
	return fields;
}

export function parseAndVerifyEcpayCallback(args: {
	params: Record<string, string | undefined>;
	credentials: EcpayCredentials;
}): EcpayCallbackResult {
	const { params, credentials } = args;
	if (!verifyCheckMacValue(params, credentials)) {
		throw new Error("Invalid ECPay CheckMacValue.");
	}
	if (params.RtnCode !== "1") {
		throw new Error(`ECPay callback RtnCode ${params.RtnCode ?? "missing"}.`);
	}
	return params as EcpayCallbackResult;
}
