# Better Auth 1.7 Account issuer

**Date:** 2026-08-23
**Status:** Active
**Related:** [OAUTH-FIRST-SIGN-IN.md](./OAUTH-FIRST-SIGN-IN.md)

## Overview

Better Auth 1.7 keys OAuth and credential accounts by `(issuer, accountId)` instead of `providerId` alone. Google sign-in queries `Account.issuer = "https://accounts.google.com"`. The Prisma `Account` model must include `issuer` and `@@unique([issuer, accountId])`.

Without the column, `/api/auth/sign-in/social` fails with `Unknown argument issuer`.

## Backfill

Existing rows were created before `issuer` existed. From `web/`:

```bash
bun --no-env-file --env-file=.env.local bin/backfill-account-issuer.ts
bun run dbpush
```

The script is idempotent. Mapping (must match the installed providers):

| `providerId` | `issuer` |
| --- | --- |
| `google` | `https://accounts.google.com` |
| `apple` | `https://appleid.apple.com` |
| `line` | `https://access.line.me` |
| `credential` / `phone` | `local:credential` |
| other OAuth | `local:oauth:<encoded providerId>` |

Helper: `web/src/lib/auth/account-issuer.ts`.
