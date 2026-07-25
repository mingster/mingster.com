"use server";

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Legal page copy lives as markdown under `public/defaults/` so it can be
 * edited without a deploy-time code change.
 */
async function readDefaultsMarkdown(fileName: string): Promise<string> {
	const filePath = path.join(process.cwd(), "public", "defaults", fileName);
	return fs.readFile(filePath, "utf8");
}

export async function getPrivacyPolicy(): Promise<string> {
	return readDefaultsMarkdown("privacy.md");
}

export async function getTermsOfService(): Promise<string> {
	return readDefaultsMarkdown("terms.md");
}
