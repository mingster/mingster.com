import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const generated = join(process.cwd(), "prisma/generated/client");

// `@prisma/client` is aliased to ./prisma/generated/client/client. The
// `prisma-client-js` generator writes client.js, but never deletes files left by
// an older generator. A leftover client.ts wins module resolution in Next, so
// the app (and better-auth's schema check) runs against an out-of-date model.
describe.skipIf(!existsSync(generated))("generated Prisma client", () => {
	test("has no leftover TypeScript sources from an older generator", () => {
		const stale = readdirSync(generated).filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"));
		expect(stale).toEqual([]);
	});

	test("schema.prisma copy matches prisma/schema.prisma", () => {
		const copy = readFileSync(join(generated, "schema.prisma"), "utf8");
		const source = readFileSync(
			join(process.cwd(), "prisma/schema.prisma"),
			"utf8",
		);
		expect(copy.includes("failedVerificationCount")).toBe(
			source.includes("failedVerificationCount"),
		);
	});
});
