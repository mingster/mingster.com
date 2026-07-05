import { describe, expect, it } from "bun:test";
import { buildEcpayAioFormPayload, parseAndVerifyEcpayCallback } from "../aio";
import { generateCheckMacValue } from "../crypto";

const creds = {
	merchantId: "2000132",
	hashKey: "5294y06JbISpM5x9",
	hashIV: "v77hoKGq4kWxNNIS",
};

describe("ecpay aio", () => {
	it("builds a payload that carries MerchantID and a valid CheckMacValue", () => {
		const payload = buildEcpayAioFormPayload(
			{
				MerchantTradeNo: "SO123",
				MerchantTradeDate: "2024/01/01 00:00:00",
				TotalAmount: 100,
				TradeDesc: "order",
				ItemName: "order",
				ReturnURL: "https://example.com/notify",
				ChoosePayment: "ALL",
			},
			creds,
		);
		expect(payload.MerchantID).toBe("2000132");
		expect(payload.CheckMacValue).toMatch(/^[0-9A-F]{64}$/);
	});

	it("accepts a valid callback and rejects a tampered one", () => {
		const base = {
			MerchantID: "2000132",
			MerchantTradeNo: "SO123",
			TradeNo: "EC123",
			RtnCode: "1",
			TradeAmt: "100",
			PaymentType: "Credit_CreditCard",
		};
		const CheckMacValue = generateCheckMacValue(base, creds);
		const result = parseAndVerifyEcpayCallback({
			params: { ...base, CheckMacValue },
			credentials: creds,
		});
		expect(result.TradeNo).toBe("EC123");

		expect(() =>
			parseAndVerifyEcpayCallback({
				params: { ...base, TradeAmt: "999", CheckMacValue },
				credentials: creds,
			}),
		).toThrow();
	});
});
