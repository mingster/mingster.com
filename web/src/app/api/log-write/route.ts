import { type NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

/**
 * Sink for browser-side logs emitted by `@/lib/client-logger`.
 * Accepts `{ logs: LogEntry[] }` and replays each entry through the server
 * pino logger so client and server logs land in the same stream.
 */

const LEVELS = new Set(["error", "warn", "info", "debug"]);
const MAX_BATCH = 50;
const MAX_MESSAGE = 2000;

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

	for (const raw of logs as IncomingLog[]) {
		if (!raw || typeof raw !== "object") continue;

		const level = LEVELS.has(raw.level ?? "") ? (raw.level as string) : "info";
		const message =
			typeof raw.message === "string"
				? raw.message.slice(0, MAX_MESSAGE)
				: "(no message)";

		const metadata = {
			...(raw.metadata ?? {}),
			clientTimestamp: raw.timestamp,
			url: raw.url,
			source: raw.source,
			stackTrace: raw.stackTrace,
			userAgent: req.headers.get("user-agent") ?? undefined,
		};

		// biome-ignore lint/suspicious/noExplicitAny: pino level is indexed dynamically
		(log as any)[level](message, { metadata, tags: raw.tags ?? ["client"] });
	}

	return NextResponse.json({ ok: true, received: logs.length });
}
