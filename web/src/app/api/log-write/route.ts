import { type NextRequest, NextResponse } from "next/server";
import {
	allowClientLogs,
	getClientIp,
	isSameOrigin,
} from "@/lib/client-log-guard";
import logger from "@/lib/logger";

/**
 * Sink for browser-side logs emitted by `@/lib/client-logger`.
 * Accepts `{ logs: LogEntry[] }` and replays each entry through the server
 * pino logger so client and server logs land in the same stream.
 *
 * The route is public, so it is hardened: same-origin only, rate limited per
 * IP, every row is tagged "client" (callers cannot pick tags), caller metadata
 * cannot overwrite server fields, and production keeps only warn and error.
 */

const LEVELS = new Set(["error", "warn", "info", "debug"]);
const MAX_BATCH = 50;
const MAX_MESSAGE = 2000;
const MAX_FIELD = 2000;
const MAX_STACK = 8000;
/** Tags a caller may add after the forced "client" tag. */
const ALLOWED_TAGS = new Set(["error", "user-action", "page-view"]);
/** Metadata keys set by the server, caller copies are dropped. */
const RESERVED_KEYS = new Set([
	"clientTimestamp",
	"url",
	"source",
	"stackTrace",
	"userAgent",
	"ip",
]);

function str(v: unknown, max: number): string | undefined {
	return typeof v === "string" ? v.slice(0, max) : undefined;
}

type IncomingLog = {
	level?: string;
	message?: string;
	timestamp?: string;
	url?: string;
	source?: string;
	stackTrace?: string;
	metadata?: Record<string, unknown>;
	tags?: string[];
};

export async function POST(req: NextRequest) {
	if (!isSameOrigin(req.headers)) {
		return NextResponse.json({ error: "forbidden" }, { status: 403 });
	}

	const log = logger.child({ module: "client-log" });

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "invalid json" }, { status: 400 });
	}

	const logs = (body as { logs?: unknown })?.logs;
	if (!Array.isArray(logs)) {
		return NextResponse.json(
			{ error: "expected { logs: [...] }" },
			{ status: 400 },
		);
	}

	if (logs.length > MAX_BATCH) {
		return NextResponse.json({ error: "batch too large" }, { status: 413 });
	}

	const ip = getClientIp(req.headers);
	if (!allowClientLogs(ip, logs.length)) {
		return NextResponse.json(
			{ error: "rate limited" },
			{ status: 429, headers: { "Retry-After": "60" } },
		);
	}

	const isProduction = process.env.NODE_ENV === "production";

	for (const raw of logs as IncomingLog[]) {
		if (!raw || typeof raw !== "object") continue;

		const level = LEVELS.has(raw.level ?? "") ? (raw.level as string) : "info";
		if (isProduction && level !== "warn" && level !== "error") continue;
		const message =
			typeof raw.message === "string"
				? raw.message.slice(0, MAX_MESSAGE)
				: "(no message)";

		const callerMetadata: Record<string, unknown> = {};
		if (raw.metadata && typeof raw.metadata === "object") {
			for (const [k, v] of Object.entries(raw.metadata)) {
				if (!RESERVED_KEYS.has(k)) callerMetadata[k] = v;
			}
		}

		const metadata = {
			...callerMetadata,
			clientTimestamp: str(raw.timestamp, 64),
			url: str(raw.url, MAX_FIELD),
			source: str(raw.source, MAX_FIELD),
			stackTrace: str(raw.stackTrace, MAX_STACK),
			userAgent: req.headers.get("user-agent") ?? undefined,
			ip,
		};

		const extraTags = Array.isArray(raw.tags)
			? raw.tags.filter((t) => typeof t === "string" && ALLOWED_TAGS.has(t))
			: [];
		const tags = ["client", ...new Set(extraTags)];

		// biome-ignore lint/suspicious/noExplicitAny: pino level is indexed dynamically
		(log as any)[level](message, { metadata, tags });
	}

	return NextResponse.json({ ok: true, received: logs.length });
}
