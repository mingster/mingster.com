# Better Auth Account issuer (unused column)

**Date:** 2026-11-22
**Status:** Active
**Related:** [OAUTH-FIRST-SIGN-IN.md](./OAUTH-FIRST-SIGN-IN.md)

## Overview

Better Auth 1.7.0 to 1.7.2 keyed accounts by `(issuer, accountId)`. From 1.7.3 on (we run 1.7.27) it is back to `providerId` plus `accountId`, and Better Auth never writes `issuer`.

`Account.issuer` stays in `prisma/schema.prisma` as an optional, unused `String?` so rows written under 1.7.0 to 1.7.2 are kept. The unique key on `(issuer, accountId)` was removed. Nothing in the app reads or writes the column.

## Why it matters

A required `issuer` column made every email sign-up and every first OAuth sign-in fail with `Argument issuer is missing` (issue #66). The test `web/src/lib/auth/__tests__/account-schema.test.ts` guards against it: any Account column Better Auth does not write must be optional or have a default, and must not sit in a unique key.

## Deploy

The change needs a schema push: `DB_PUSH=1`, run by release-manager with a `pg_dump` taken first. The push only relaxes NOT NULL and drops a unique index, so it needs no data loss flag.

The old backfill script and issuer helper were removed because nothing uses them.
