import { afterEach, describe, expect, test } from "bun:test";

const original = process.env.STRIPE_SECRET_KEY;

afterEach(() => {
	if (original === undefined) {
		delete process.env.STRIPE_SECRET_KEY;
	} else {
		process.env.STRIPE_SECRET_KEY = original;
	}
});

describe("stripe client config", () => {
	test("importing it without STRIPE_SECRET_KEY does not throw", async () => {
		delete process.env.STRIPE_SECRET_KEY;
		const mod = await import("../config?no-key");
		expect(mod.stripe).toBeDefined();
	});

	test("first use creates a working client when the key is set", async () => {
		process.env.STRIPE_SECRET_KEY = "sk_test_x";
		const mod = await import("../config?with-key");
		expect(typeof mod.stripe.prices.retrieve).toBe("function");
	});

	test("first use without the key throws, not the import", async () => {
		delete process.env.STRIPE_SECRET_KEY;
		const mod = await import("../config?use-no-key");
		expect(() => mod.stripe.prices).toThrow();
	});
});
