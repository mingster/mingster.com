import { beforeEach, describe, expect, mock, test } from "bun:test";
import { NextRequest } from "next/server";

type Call = { level: string; message: string; opts: any };
const calls: Call[] = [];

const child = new Proxy(
	{},
	{
		get: (_t, level: string) => (message: string, opts: any) => {
			calls.push({ level, message, opts });
		},
	},
);
mock.module("@/lib/logger", () => ({
	default: { child: () => child },
}));

const { POST } = await import("../route");
const { resetClientLogLimits, MAX_ENTRIES_PER_IP } = await import(
	"@/lib/client-log-guard"
);

function req(
	body: unknown,
	headers: Record<string, string> = { "sec-fetch-site": "same-origin" },
) {
	return new NextRequest("http://localhost:3002/api/log-write", {
		method: "POST",
		headers: { "content-type": "application/json", ...headers },
		body: JSON.stringify(body),
	});
}

beforeEach(() => {
	calls.length = 0;
	resetClientLogLimits();
	// biome-ignore lint/suspicious/noExplicitAny: test env override
	(process.env as any).NODE_ENV = "test";
});

describe("POST /api/log-write", () => {
	test("accepts a normal client entry and tags it as client", async () => {
		const res = await POST(
			req({
				logs: [
					{
						level: "error",
						message: "boom",
						tags: ["error", "client"],
						metadata: { a: 1 },
					},
				],
			}),
		);
		expect(res.status).toBe(200);
		expect(calls).toHaveLength(1);
		expect(calls[0].opts.tags[0]).toBe("client");
		expect(calls[0].opts.metadata.a).toBe(1);
	});

	test("caller cannot choose tags such as api or sysAdmin", async () => {
		await POST(
			req({
				logs: [{ level: "warn", message: "x", tags: ["api", "sysAdmin"] }],
			}),
		);
		expect(calls[0].opts.tags).toEqual(["client"]);
	});

	test("caller metadata keys that collide with server fields are dropped", async () => {
		await POST(
			req({
				logs: [
					{
						level: "warn",
						message: "x",
						url: "/real",
						metadata: { url: "/forged", userAgent: "forged", ok: true },
					},
				],
			}),
		);
		const meta = calls[0].opts.metadata;
		expect(meta.url).toBe("/real");
		expect(meta.userAgent).not.toBe("forged");
		expect(meta.ok).toBe(true);
	});

	test("rejects a cross-origin request", async () => {
		const res = await POST(
			req(
				{ logs: [{ level: "error", message: "x" }] },
				{ "sec-fetch-site": "cross-site" },
			),
		);
		expect(res.status).toBe(403);
		expect(calls).toHaveLength(0);
	});

	test("rejects a request with no origin information", async () => {
		const res = await POST(
			req({ logs: [{ level: "error", message: "x" }] }, {}),
		);
		expect(res.status).toBe(403);
	});

	test("accepts an Origin that matches the host when Sec-Fetch-Site is absent", async () => {
		const res = await POST(
			req(
				{ logs: [{ level: "error", message: "x" }] },
				{ origin: "http://localhost:3002", host: "localhost:3002" },
			),
		);
		expect(res.status).toBe(200);
	});

	test("rate limits per IP with 429", async () => {
		const headers = { "sec-fetch-site": "same-origin", "x-real-ip": "1.2.3.4" };
		const entries = Array.from({ length: MAX_ENTRIES_PER_IP }, () => ({
			level: "error",
			message: "x",
		}));
		// 50 per batch max, so two batches reach the cap
		const half = entries.slice(0, MAX_ENTRIES_PER_IP / 2);
		expect((await POST(req({ logs: half }, headers))).status).toBe(200);
		expect((await POST(req({ logs: half }, headers))).status).toBe(200);
		const res = await POST(req({ logs: [entries[0]] }, headers));
		expect(res.status).toBe(429);
		// another IP is unaffected
		const other = await POST(
			req({ logs: [entries[0]] }, { ...headers, "x-real-ip": "5.6.7.8" }),
		);
		expect(other.status).toBe(200);
	});

	test("production stores only warn and error", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: test env override
		(process.env as any).NODE_ENV = "production";
		await POST(
			req({
				logs: [
					{ level: "info", message: "i" },
					{ level: "debug", message: "d" },
					{ level: "weird", message: "w" },
					{ level: "warn", message: "w" },
					{ level: "error", message: "e" },
				],
			}),
		);
		expect(calls.map((c) => c.level)).toEqual(["warn", "error"]);
	});
});
