import { describe, expect, it } from "bun:test";
import { generateCheckMacValue, verifyCheckMacValue } from "../crypto";

const creds = {
	merchantId: "2000132",
	hashKey: "5294y06JbISpM5x9",
	hashIV: "v77hoKGq4kWxNNIS",
};

const sampleParams = {
	MerchantID: "2000132",
	MerchantTradeNo: "Test1234",
	MerchantTradeDate: "2024/01/01 00:00:00",
	PaymentType: "aio",
	TotalAmount: "100",
	TradeDesc: "test",
	ItemName: "item",
	ReturnURL: "https://example.com/return",
	ChoosePayment: "ALL",
};

describe("ecpay CheckMacValue", () => {
	it("generates a 64-char uppercase hex hash", () => {
		const mac = generateCheckMacValue(sampleParams, creds);
		expect(mac).toMatch(/^[0-9A-F]{64}$/);
	});

	it("verifies its own output and rejects tampering", () => {
		const mac = generateCheckMacValue(sampleParams, creds);
		expect(
			verifyCheckMacValue({ ...sampleParams, CheckMacValue: mac }, creds),
		).toBe(true);
		expect(
			verifyCheckMacValue({ ...sampleParams, CheckMacValue: "BAD" }, creds),
		).toBe(false);
	});
});
