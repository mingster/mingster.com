/**
 * Prisma ORM 7 — CLI config (migrations, db push, generate).
 * Runtime connection uses POSTGRES_URL + @prisma/adapter-pg in src/lib/prismadb.ts
 */
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: env("POSTGRES_URL"),
	},
});
