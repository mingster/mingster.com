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
/** Hard cap on tracked IPs. When full, the oldest entry is evicted. */
export const MAX_TRACKED_IPS = 5000;

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();
let globalBucket: Bucket = { windowStart: 0, count: 0 };

/** Number of IPs currently tracked (for tests). */
export function trackedClientLogIps(): number {
	return buckets.size;
}

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

function roll(bucket: Bucket, now: number): void {
	if (now - bucket.windowStart >= WINDOW_MS) {
		bucket.windowStart = now;
		bucket.count = 0;
	}
}

function fits(bucket: Bucket, n: number, max: number, now: number): boolean {
	roll(bucket, now);
	return bucket.count + n <= max;
}

/**
 * Returns true when `entries` more log entries from `ip` are allowed.
 * Both limits are checked before anything is allocated or spent, so a refused
 * request leaves no state behind. The IP map is capped: expired buckets go
 * first, then the oldest inserted IPs. Evicting (not rejecting) keeps real
 * users served during an IP flood; the global limit still bounds total volume.
 */
export function allowClientLogs(
	ip: string,
	entries: number,
	now = Date.now(),
): boolean {
	if (!fits(globalBucket, entries, MAX_ENTRIES_GLOBAL, now)) return false;

	let bucket = buckets.get(ip);
	if (bucket) {
		if (!fits(bucket, entries, MAX_ENTRIES_PER_IP, now)) return false;
	} else {
		if (entries > MAX_ENTRIES_PER_IP) return false;
		if (buckets.size >= MAX_TRACKED_IPS) {
			for (const [key, b] of buckets) {
				if (now - b.windowStart >= WINDOW_MS) buckets.delete(key);
			}
			// Map iterates in insertion order, so this drops the oldest first.
			for (const key of buckets.keys()) {
				if (buckets.size < MAX_TRACKED_IPS) break;
				buckets.delete(key);
			}
		}
		bucket = { windowStart: now, count: 0 };
		buckets.set(ip, bucket);
	}
	bucket.count += entries;
	globalBucket.count += entries;
	return true;
}
