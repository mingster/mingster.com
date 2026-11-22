import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAuthTables } from "better-auth/db";

/**
 * Issue #66: Better Auth 1.7.27 does not write `account.issuer`. A column it
 * does not write must accept an insert that omits it, and must not sit in a
 * unique key, or every email sign-up and first OAuth sign-in fails in the
 * database.
 */
const source = readFileSync(
	join(process.cwd(), "prisma/schema.prisma"),
	"utf8",
);
const body = source.match(/model Account \{([\s\S]*?)\n\}/)?.[1] ?? "";
const lines = body.split("\n").map((l) => l.trim());

const fields = lines
	.filter((l) => l && !l.startsWith("@@") && !l.startsWith("//"))
	.map((l) => {
		const m = l.match(/^(\w+)\s+(\w+)(\?)?(\[\])?\s*(.*)$/);
		return m
			? {
					name: m[1],
					optional: !!m[3],
					hasDefault: /@default\(/.test(m[5]),
					isId: /@id\b/.test(m[5]),
					isRelation: /@relation\(/.test(m[5]) || m[2] === "User",
				}
			: null;
	})
	.filter((f): f is NonNullable<typeof f> => f !== null);

const written = new Set(
	Object.entries(getAuthTables({}).account.fields).map(
		([key, f]) => (f as { fieldName?: string }).fieldName || key,
	),
);
written.add("id");

describe("Prisma Account model vs Better Auth account writes", () => {
	test("parses the Account model", () => {
		expect(fields.map((f) => f.name)).toContain("providerId");
	});

	test("every column Better Auth does not write accepts an insert without it", () => {
		const blocking = fields
			.filter((f) => !f.isRelation && !written.has(f.name))
			.filter((f) => !f.optional && !f.hasDefault && !f.isId)
			.map((f) => f.name);

		expect(blocking).toEqual([]);
	});

	test("no unique key includes a column Better Auth does not write", () => {
		const unwritten = fields
			.filter((f) => !f.isRelation && !written.has(f.name))
			.map((f) => f.name);
		const uniques = lines.filter((l) => l.startsWith("@@unique"));

		for (const u of uniques) {
			for (const name of unwritten) {
				expect(u).not.toMatch(new RegExp(`\\b${name}\\b`));
			}
		}
	});
});
