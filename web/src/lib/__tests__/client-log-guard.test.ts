import { beforeEach, describe, expect, test } from "bun:test";
import {
	MAX_ENTRIES_GLOBAL,
	MAX_ENTRIES_PER_IP,
	MAX_TRACKED_IPS,
	allowClientLogs,
	resetClientLogLimits,
	trackedClientLogIps,
} from "../client-log-guard";

describe("client log guard caps", () => {
	beforeEach(() => resetClientLogLimits());

	test("tracked IP map never grows past the cap inside one window", () => {
		const now = 1_000_000;
		for (let i = 0; i < MAX_TRACKED_IPS + 500; i++) {
			allowClientLogs(`ip-${i}`, 0, now);
		}
		expect(trackedClientLogIps()).toBeLessThanOrEqual(MAX_TRACKED_IPS);
	});

	test("when full, the oldest IP is evicted and a new IP is still served", () => {
		const now = 1_000_000;
		for (let i = 0; i < MAX_TRACKED_IPS; i++)
			allowClientLogs(`ip-${i}`, 0, now);
		expect(allowClientLogs("newcomer", 1, now)).toBe(true);
		expect(trackedClientLogIps()).toBe(MAX_TRACKED_IPS);
		// ip-0 was evicted, so it starts with a fresh bucket (full allowance).
		expect(allowClientLogs("ip-0", MAX_ENTRIES_PER_IP, now)).toBe(true);
	});

	test("a request refused by the global limit leaves no bucket behind", () => {
		const now = 1_000_000;
		const fullIps = Math.floor(MAX_ENTRIES_GLOBAL / MAX_ENTRIES_PER_IP);
		for (let i = 0; i < fullIps; i++) {
			expect(allowClientLogs(`ip-${i}`, MAX_ENTRIES_PER_IP, now)).toBe(true);
		}
		const before = trackedClientLogIps();
		expect(allowClientLogs("late-ip", 1, now)).toBe(false);
		expect(trackedClientLogIps()).toBe(before);
	});

	test("a per-IP refusal does not spend the global allowance", () => {
		const now = 1_000_000;
		expect(allowClientLogs("a", MAX_ENTRIES_PER_IP, now)).toBe(true);
		expect(allowClientLogs("a", 1, now)).toBe(false);
		const others = Math.floor(MAX_ENTRIES_GLOBAL / MAX_ENTRIES_PER_IP) - 1;
		for (let i = 0; i < others; i++) {
			expect(allowClientLogs(`b-${i}`, MAX_ENTRIES_PER_IP, now)).toBe(true);
		}
	});
});
