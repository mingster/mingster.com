/**
 * Backfill Better Auth 1.7 `account.issuer` from legacy `providerId`.
 *
 * Google sign-in looks up `(issuer, accountId)`. Without this column the Prisma
 * adapter throws `Unknown argument issuer`.
 *
 * Run before `bun run dbpush` so existing rows are populated before the
 * column is made NOT NULL and unique on `(issuer, accountId)`.
 *
 * Usage (from `web/`):
 *   bun --no-env-file --env-file=.env.local bin/backfill-account-issuer.ts [--dry-run]
 */
import { issuerForLegacyProviderId } from "../src/lib/auth/account-issuer";
import { sqlClient } from "../src/lib/prismadb";

const dryRun = process.argv.includes("--dry-run");

type ProviderCount = { providerId: string; count: bigint };
type Collision = {
	issuer: string;
	accountId: string;
	accountCount: bigint;
	userCount: bigint;
};

async function main() {
	const inventory = await sqlClient.$queryRaw<ProviderCount[]>`
		SELECT "providerId", COUNT(*)::bigint AS count
		FROM "account"
		GROUP BY "providerId"
		ORDER BY "providerId"
	`;
	console.info("Account rows by providerId:");
	for (const row of inventory) {
		console.info(`  ${row.providerId}: ${row.count}`);
	}

	if (dryRun) {
		for (const row of inventory) {
			console.info(
				`  would set issuer=${issuerForLegacyProviderId(row.providerId)}`,
			);
		}
		return;
	}

	await sqlClient.$executeRawUnsafe(
		`ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" TEXT`,
	);

	for (const row of inventory) {
		const issuer = issuerForLegacyProviderId(row.providerId);
		const updated = await sqlClient.$executeRaw`
			UPDATE "account"
			SET "issuer" = ${issuer}
			WHERE "providerId" = ${row.providerId}
				AND ("issuer" IS NULL OR "issuer" = '')
		`;
		console.info(
			`Set issuer=${issuer} for providerId=${row.providerId} (${updated} row(s))`,
		);
	}

	const missing = await sqlClient.$queryRaw<{ count: bigint }[]>`
		SELECT COUNT(*)::bigint AS count
		FROM "account"
		WHERE "issuer" IS NULL OR "issuer" = ''
	`;
	const missingCount = Number(missing[0]?.count ?? 0);
	if (missingCount > 0) {
		throw new Error(
			`${missingCount} account row(s) still missing issuer; aborting`,
		);
	}

	const collisions = await sqlClient.$queryRaw<Collision[]>`
		SELECT
			issuer,
			"accountId",
			COUNT(*)::bigint AS "accountCount",
			COUNT(DISTINCT "userId")::bigint AS "userCount"
		FROM "account"
		GROUP BY issuer, "accountId"
		HAVING COUNT(*) > 1
	`;
	if (collisions.length > 0) {
		console.error("issuer+accountId collisions (unique index cannot be added):");
		for (const row of collisions) {
			console.error(
				`  issuer=${row.issuer} accountId=${row.accountId} accounts=${row.accountCount} users=${row.userCount}`,
			);
		}
		throw new Error("Resolve account identity collisions before dbpush");
	}

	await sqlClient.$executeRawUnsafe(
		`ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL`,
	);
	// `prisma db push` creates the @@unique as a plain unique INDEX with this
	// name, so on every deploy after the first, ADD CONSTRAINT would fail with
	// 42P07 (duplicate_table, "relation already exists") rather than the 42710
	// (duplicate_object) a duplicate constraint raises. Skip when anything owns
	// the name; keep the handler for both codes in case of a concurrent deploy.
	await sqlClient.$executeRawUnsafe(`
		DO $$ BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM pg_class c
				JOIN pg_namespace n ON n.oid = c.relnamespace
				WHERE c.relname = 'account_issuer_accountId_key'
					AND n.nspname = current_schema()
			) THEN
				ALTER TABLE "account"
				ADD CONSTRAINT "account_issuer_accountId_key" UNIQUE ("issuer", "accountId");
			END IF;
		EXCEPTION
			WHEN duplicate_object OR duplicate_table THEN NULL;
		END $$;
	`);

	console.info(
		"Account issuer backfill complete; column is NOT NULL with unique (issuer, accountId).",
	);
}

await main();
await sqlClient.$disconnect();
