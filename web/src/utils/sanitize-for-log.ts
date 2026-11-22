/** Shortens an error or value for a log line: base64 blobs removed, 400 chars at most. */
export function sanitizeForLog(value: unknown): string {
	const raw = value instanceof Error ? value.message : String(value ?? "");
	return raw.replace(/[A-Za-z0-9+/]{100,}={0,2}/g, "[base64]").slice(0, 400);
}
