// LINK - https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
//import { PrismaClient as mongoPrismaClient } from "@prisma-mongo/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as sqlPrismaClient } from "@prisma/client";
import pg from "pg";

/**
 * Prisma Client Singleton
 *
 * Connection Pooling:
 * - Prisma manages connection pooling automatically via the adapter
 * - Default pool size: 10 connections
 * - To configure, add to your DATABASE_URL:
 *   postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=20
 *
 * For "too many connections" errors:
 * 1. Use the global singleton pattern (already implemented below)
 * 2. Reduce connection_limit in your DATABASE_URL
 * 3. Run: bun run bin/close-db-connections.ts to clean up stale connections
 * 4. Restart your dev server
 */

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
	if (process.env.NODE_ENV === "production") {
		throw new Error("POSTGRES_URL must be defined");
	} else {
		console.warn("POSTGRES_URL is missing in dev");
	}
}

// Ensure pg import works in different environments
const Pool = pg.Pool;
if (!Pool) {
	throw new Error("Failed to import pg.Pool");
}

const pool = new Pool({
	connectionString: connectionString || "postgres://localhost:5432/postgres", // Fallback for dev if missing
});
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
	// Check for adapter validity (basic check)
	if (!adapter) {
		throw new Error("Failed to initialize PrismaPg adapter");
	}

	return new sqlPrismaClient({
		adapter,
	});
};

declare global {
	var client: undefined | ReturnType<typeof prismaClientSingleton>;
	//var mongo: mongoPrismaClient | undefined;
}

export const sqlClient = globalThis.client ?? prismaClientSingleton();
//export const mongoClient = globalThis.mongo || new mongoPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.client = sqlClient;
	//globalThis.mongo = new mongoPrismaClient();
}

// Gracefully cleanup on hot reload
if (process.env.NODE_ENV !== "production") {
	process.on("SIGTERM", async () => {
		await sqlClient.$disconnect();
	});
	process.on("SIGINT", async () => {
		await sqlClient.$disconnect();
	});
}

// Default export for compatibility
export default sqlClient;
