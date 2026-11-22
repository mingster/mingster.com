import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const generated = join(process.cwd(), "prisma/generated/client");

// `@prisma/client` is aliased to ./prisma/generated/client/client. The
// `prisma-client-js` generator writes client.js, but never deletes files left by
// an older generator. A leftover client.ts wins module resolution in Next, so
// the app (and better-auth's schema check) runs against an out-of-date model.

function listFiles(dir: string, prefix = ""): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? listFiles(join(dir, entry.name), `${prefix}${entry.name}/`)
			: [`${prefix}${entry.name}`],
	);
}

function modelFields(schema: string, model: string): string[] {
	const body = schema.match(new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`));
	if (!body) throw new Error(`model ${model} not found`);
	return body[1]
		.split("\n")
		.map((line) => line.trim().replace(/\s+/g, " "))
		.filter((line) => line && !line.startsWith("//"));
}

describe("generated Prisma client", () => {
	test("exists (run `bun run sql:generate`)", () => {
		expect(existsSync(generated)).toBe(true);
	});

	test("has no leftover TypeScript sources from an older generator", () => {
		const stale = listFiles(generated).filter(
			(f) => f.endsWith(".ts") && !f.endsWith(".d.ts"),
		);
		expect(stale).toEqual([]);
	});

	test("TwoFactor model in the generated schema matches prisma/schema.prisma", () => {
		const copy = readFileSync(join(generated, "schema.prisma"), "utf8");
		const source = readFileSync(
			join(process.cwd(), "prisma/schema.prisma"),
			"utf8",
		);
		expect(modelFields(copy, "TwoFactor")).toEqual(
			modelFields(source, "TwoFactor"),
		);
	});
});
