import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { twoFactor } from "better-auth/plugins";

type PrismaField = { type: string; optional: boolean; defaultValue?: string };

function parsePrismaModel(model: string): Record<string, PrismaField> {
	const source = readFileSync(
		join(process.cwd(), "prisma/schema.prisma"),
		"utf8",
	);
	const body = source.match(new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`));
	if (!body) throw new Error(`model ${model} not found`);
	const fields: Record<string, PrismaField> = {};
	for (const line of body[1].split("\n")) {
		const m = line.trim().match(/^(\w+)\s+(\w+)(\?)?(\[\])?\s*(.*)$/);
		if (!m || line.trim().startsWith("@@")) continue;
		const def = m[5].match(/@default\(([^)]*(?:\([^)]*\))?[^)]*)\)/);
		fields[m[1]] = { type: m[2], optional: !!m[3], defaultValue: def?.[1] };
	}
	return fields;
}

const PRISMA_TYPE: Record<string, string> = {
	string: "String",
	boolean: "Boolean",
	number: "Int",
	date: "DateTime",
};

describe("Prisma TwoFactor model matches the better-auth twoFactor plugin", () => {
	const pluginFields = twoFactor().schema.twoFactor.fields as Record<
		string,
		{
			type: string;
			required?: boolean;
			defaultValue?: unknown;
			fieldName?: string;
		}
	>;
	const prismaFields = parsePrismaModel("TwoFactor");

	for (const [name, field] of Object.entries(pluginFields)) {
		test(`field ${name}`, () => {
			const prisma = prismaFields[field.fieldName ?? name];
			expect(prisma).toBeDefined();
			expect(prisma.type).toBe(PRISMA_TYPE[field.type]);
			// A column the plugin may omit must be nullable or carry a default.
			if (field.required === false) {
				expect(prisma.optional || prisma.defaultValue !== undefined).toBe(true);
			}
			// Rows created before the column existed must keep the plugin's meaning.
			if (typeof field.defaultValue === "boolean") {
				expect(prisma.defaultValue).toBe(String(field.defaultValue));
			}
			if (typeof field.defaultValue === "number") {
				expect(prisma.defaultValue).toBe(String(field.defaultValue));
			}
		});
	}
});
