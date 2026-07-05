import { beforeAll, describe, expect, it, mock } from "bun:test";

mock.module("@/lib/logger", () => ({
	default: {
		info: mock(() => undefined),
		warn: mock(() => undefined),
		error: mock(() => undefined),
	},
}));

import type { TapPayCredentials, TapPayPayByPrimeInput } from "../types";

const creds: TapPayCredentials = {
	appId: "123",
	appKey: "app_key",
	partnerKey: "partner_key",
	merchantId: "MERCH",
};

describe("tappay client", () => {
	let buildPayByPrimeRequest: (
		input: TapPayPayByPrimeInput,
		credentials: TapPayCredentials,
	) => ReturnType<typeof import("../client").buildPayByPrimeRequest>;
	let isPayByPrimeSuccess: (result: { status: number }) => boolean;

	beforeAll(async () => {
		const mod = await import("../client");
		buildPayByPrimeRequest = mod.buildPayByPrimeRequest;
		isPayByPrimeSuccess = mod.isPayByPrimeSuccess;
	});

	it("builds a pay-by-prime request body", () => {
		const body = buildPayByPrimeRequest(
			{
				prime: "test_prime",
				amount: 100,
				orderNumber: "SO123",
				details: "order",
				cardholder: { name: "A", email: "a@b.c" },
			},
			creds,
		);
		expect(body.prime).toBe("test_prime");
		expect(body.partner_key).toBe("partner_key");
		expect(body.merchant_id).toBe("MERCH");
		expect(body.amount).toBe(100);
		expect(body.cardholder.email).toBe("a@b.c");
	});

	it("recognizes success only at status 0", () => {
		expect(isPayByPrimeSuccess({ status: 0, msg: "ok" })).toBe(true);
		expect(isPayByPrimeSuccess({ status: 2, msg: "bad" })).toBe(false);
	});
});
