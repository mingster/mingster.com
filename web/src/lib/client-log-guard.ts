/**
 * Guards for the public `/api/log-write` sink: same-origin check, caller IP
 * and a small in-memory rate limit. The app runs as one pm2 process, so
 * in-memory state is enough.
 */

const WINDOW_MS = 60_000;
/** Log entries accepted per IP per window. */
export const MAX_ENTRIES_PER_IP = 100;
/** Log entries accepted across all IPs per window, a backstop for IP rotation. */
export const MAX_ENTRIES_GLOBAL = 2000;
const MAX_TRACKED_IPS = 5000;

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();
let globalBucket: Bucket = { windowStart: 0, count: 0 };

export function resetClientLogLimits(): void {
	buckets.clear();
	globalBucket = { windowStart: 0, count: 0 };
}

/** Same-origin only: the client logger runs in our own pages. */
export function isSameOrigin(headers: Headers): boolean {
	const fetchSite = headers.get("sec-fetch-site");
	if (fetchSite) return fetchSite === "same-origin";

	const origin = headers.get("origin");
	const host = headers.get("x-forwarded-host") ?? headers.get("host");
	if (!origin || !host) return false;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}

/**
 * Client IP behind the reverse proxy. `x-real-ip` first, else the rightmost
 * `x-forwarded-for` hop (the one our own proxy appended, not caller supplied).
 */
export function getClientIp(headers: Headers): string {
	const real = headers.get("x-real-ip")?.trim();
	if (real) return real;
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		const parts = forwarded.split(",");
		const last = parts[parts.length - 1]?.trim();
		if (last) return last;
	}
	return "unknown";
}

function take(bucket: Bucket, n: number, max: number, now: number): boolean {
	if (now - bucket.windowStart >= WINDOW_MS) {
		bucket.windowStart = now;
		bucket.count = 0;
	}
	if (bucket.count + n > max) return false;
	bucket.count += n;
	return true;
}

/** Returns true when `entries` more log entries from `ip` are allowed. */
export function allowClientLogs(
	ip: string,
	entries: number,
	now = Date.now(),
): boolean {
	if (buckets.size > MAX_TRACKED_IPS) {
		for (const [key, b] of buckets) {
			if (now - b.windowStart >= WINDOW_MS) buckets.delete(key);
		}
	}
	let bucket = buckets.get(ip);
	if (!bucket) {
		bucket = { windowStart: now, count: 0 };
		buckets.set(ip, bucket);
	}
	if (!take(bucket, entries, MAX_ENTRIES_PER_IP, now)) return false;
	if (!take(globalBucket, entries, MAX_ENTRIES_GLOBAL, now)) {
		bucket.count -= entries;
		return false;
	}
	return true;
}
