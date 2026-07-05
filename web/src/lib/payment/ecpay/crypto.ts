import { createHash } from "node:crypto";
import type { EcpayCredentials } from "./types";

/** .NET HttpUtility.UrlEncode-compatible encoding, lowercased, per ECPay spec. */
function dotNetUrlEncode(value: string): string {
	return encodeURIComponent(value)
		.toLowerCase()
		.replace(/%20/g, "+")
		.replace(/%21/g, "!")
		.replace(/%28/g, "(")
		.replace(/%29/g, ")")
		.replace(/%2a/g, "*")
		.replace(/%2d/g, "-")
		.replace(/%2e/g, ".")
		.replace(/%5f/g, "_");
}

export function generateCheckMacValue(
	params: Record<string, string | number | undefined>,
	credentials: EcpayCredentials,
): string {
	const entries = Object.entries(params)
		.filter(([key, value]) => key !== "CheckMacValue" && value !== undefined)
		.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));

	const joined = entries.map(([k, v]) => `${k}=${v}`).join("&");
	const raw = `HashKey=${credentials.hashKey}&${joined}&HashIV=${credentials.hashIV}`;
	const encoded = dotNetUrlEncode(raw);
	return createHash("sha256").update(encoded).digest("hex").toUpperCase();
}

export function verifyCheckMacValue(
	params: Record<string, string | undefined>,
	credentials: EcpayCredentials,
): boolean {
	const provided = params.CheckMacValue?.trim().toUpperCase();
	if (!provided) return false;
	const expected = generateCheckMacValue(params, credentials);
	return expected === provided;
}
