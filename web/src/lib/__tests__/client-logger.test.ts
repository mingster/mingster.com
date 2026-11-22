import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

mock.module("@/lib/logger", () => ({
	default: { error: () => {}, warn: () => {}, info: () => {} },
}));
mock.module("../analytics", () => ({
	analytics: { trackError: () => {} },
}));

const { clientLogger, MAX_SEND_RETRIES } = await import("../client-logger");

type Timer = { fn: () => void; ms: number };
const realFetch = globalThis.fetch;
const realSetTimeout = globalThis.setTimeout;
let timers: Timer[] = [];
let sent = 0;

async function flush() {
	for (let i = 0; i < 10; i++) await Promise.resolve();
}

async function runNextTimer() {
	const t = timers.shift();
	if (!t) throw new Error("no timer scheduled");
	t.fn();
	await flush();
	return t;
}

beforeEach(() => {
	timers = [];
	sent = 0;
	globalThis.fetch = (async () => {
		sent++;
		return new Response(null, { status: 503 });
	}) as unknown as typeof fetch;
	globalThis.setTimeout = ((fn: () => void, ms: number) => {
		timers.push({ fn, ms });
		return timers.length as unknown as ReturnType<typeof setTimeout>;
	}) as unknown as typeof setTimeout;
});

afterEach(() => {
	globalThis.fetch = realFetch;
	globalThis.setTimeout = realSetTimeout;
});

describe("client logger 5xx retry", () => {
	test("retries a failing batch a bounded number of times, then drops it", async () => {
		clientLogger.info("down");
		await flush();
		let guard = 0;
		while (timers.length > 0 && guard++ < 50) await runNextTimer();
		// first attempt plus MAX_SEND_RETRIES retries, then no more.
		expect(sent).toBe(1 + MAX_SEND_RETRIES);
		expect(timers.length).toBe(0);
	});

	test("backs off between retries", async () => {
		clientLogger.info("down");
		await flush();
		const delays: number[] = [];
		let guard = 0;
		while (timers.length > 0 && guard++ < 50) {
			delays.push((await runNextTimer()).ms);
		}
		expect(delays.length).toBe(MAX_SEND_RETRIES);
		for (let i = 1; i < delays.length; i++) {
			expect(delays[i]).toBeGreaterThan(delays[i - 1] as number);
		}
	});

	test("a new log during backoff does not bypass the wait", async () => {
		clientLogger.info("down");
		await flush();
		const afterFirst = sent;
		clientLogger.info("another");
		await flush();
		expect(sent).toBe(afterFirst);
		let guard = 0;
		while (timers.length > 0 && guard++ < 50) await runNextTimer();
	});

	test("the retry counter resets after a dropped batch", async () => {
		clientLogger.info("down");
		await flush();
		let guard = 0;
		while (timers.length > 0 && guard++ < 50) await runNextTimer();
		sent = 0;
		clientLogger.info("down again");
		await flush();
		while (timers.length > 0 && guard++ < 100) await runNextTimer();
		expect(sent).toBe(1 + MAX_SEND_RETRIES);
	});
});
