# Strip to three features

mingster.com was a fork of the riben.life codebase and carried its entire
multi-tenant commerce platform. This cleanup reduced it to the three features it
actually serves: **auth**, **VirtualExperience**, and **blog**.

Branch: `chore/strip-to-three-features`

## Result

| | Before | After |
|---|---|---|
| Tracked files under `web/src` | 952 | 180 |
| Prisma models | 92 | 18 |
| `prisma/schema.prisma` | 2,523 lines | 428 lines |
| `public/` assets removed | — | 51 files, 28 MB |
| Typecheck errors | 387 | 14 (all pre-existing, see below) |

## How the keep-set was chosen

Not by directory. A script walked the **import closure** from the real entry
points — layout, page, route handlers, `proxy.ts`, `types.d.ts` — and kept only
files reachable from them. Everything unreachable was deleted.

Import analysis alone was not enough. Three things had to be found by hand
because they are referenced as **runtime strings**, invisible to import graphs:

- `app/api/og` — the blog builds OG image URLs as `` `/api/og?path=...` ``
- `app/api/common/get-locales` — fetched by the account locale selector
- `app/qr-generator` — opened in an iframe by the VE `/qrcode` slash command

`(root)/privacy` and `(root)/terms` were deleted and then **restored**: the
sign-in form links to them, so they are part of auth.

## Kept beyond the three features

| Path | Why |
|---|---|
| `app/qr-generator/` | VE slash command target |
| `app/api/og/` | blog OG images |
| `app/account/` | the only host for profile + sign out |
| `lib/stripe/` | imported by `lib/auth.ts`; the Stripe auth plugin was retained |
| `lib/mail/`, `lib/notification/import-message-template-backup.ts` | auth email pipeline |
| `Store` model | `MessageTemplate` and `EmailQueue` have FKs to it. Trimmed from 35 columns to 7 — only `id`, `organizationId`, `name`, `ownerId`, `isDeleted`, `createdAt`, `updatedAt` are read (and only `id`/`name` by `resolveStoreForAuthEmail`) |

## Decisions taken

- **Both sign-in UIs kept** — `/auth/[authView]` (better-auth-ui) and
  `/(root)/signIn` (custom provider buttons).
- **All 13 Better Auth plugins kept**, including `stripe`, `organization`,
  `admin` and `apiKey`.
- **Auth email keeps the DB queue + template system** rather than switching to
  direct sends. See the open items below.
- **`package.json` was not modified.** Candidate removals are triaged in
  [`CLEANUP_DEP_CANDIDATES.md`](./CLEANUP_DEP_CANDIDATES.md).
- **Existing DB data is expendable**, so field-level trimming went further than
  it otherwise would and `db push --accept-data-loss` replaces a migration.

## Rewritten, not just deleted

- `utils/account-linking.ts` — migrated reservations, orders, credit ledgers,
  addresses and the message queue. Now carries over profile fields and moves
  organization memberships only.
- `types/current-user.ts` — dropped the Orders/Reservations/Credit includes.
- `bin/install.ts` — seeded countries, currencies, payment and shipping methods.
  Now seeds locales, platform settings, and auth message templates.
- `lib/legal-content.ts` — replaces `actions/store/get-content-{privacy,tos}`.

## Bugs found and fixed along the way

- **`animations/Rapping.fbx` → `rapping.fbx`.** `AvatarGLB.tsx` maps
  `Rapping: "animations/rapping.fbx"` (lowercase). This resolved on
  case-insensitive macOS but 404s on case-sensitive Linux, so the Rapping
  animation was silently broken in production.
- **`/api/log-write` did not exist.** `lib/client-logger.ts` has always POSTed
  browser logs to it. The route now exists and replays entries through the
  server pino logger.
- **Dead nav links.** `dropdown-user.tsx` linked to `/account/order-history`,
  `/storeAdmin/` and `/sysAdmin`.

## Open items

1. **Run `bun install`.** `node_modules` is installed from a stale, downgraded
   set (`better-auth@1.6.14` against a `^1.6.25` manifest). All 14 remaining
   typecheck errors are that mismatch — code calls the 1.6.25 client API
   (`authClient.passkey`, `.magicLink`, `.phoneNumber`, `session.user.role`,
   `emailAndPassword.account`, `line.scopes`) which 1.6.14 does not expose.
   Nothing here needs a code change.
2. **A stash is waiting.** `git stash list` holds
   *"pre-cleanup WIP: better-auth pinned to 1.6.14 + stray root package.json/bun.lock"*.
   It contains the downgrade above plus a stray root `package.json`/`bun.lock`
   that look like an accidental `bun add` from the repo root. Review and most
   likely drop it.
3. **Nothing drains `emailQueue`.** Magic-link and password-reset emails are
   written to the table and never sent. Needs a sendmail cron. Until then those
   two sign-in paths do not deliver.
4. **Seed the auth templates** — `bun run install:data`. Without them
   `messageTemplateLocalized` has no `auth.magic_link` row and the sender logs
   an error and returns.
5. **Run `bun run dbpush`.** Existing data is expendable, so `prisma db push`
   drops the 74 orphaned tables, the view and the 2 enum types on its own —
   no hand-written migration needed:

   ```bash
   cd web && bun run sql:generate && bun x prisma db push --accept-data-loss
   ```

   Then `bun run install:data` to reseed locales, platform settings and the auth
   message templates.
6. **Unreferenced VE assets, left in place deliberately:**
   `public/models/character-ming.glb` (12 MB), `public/models/avatar/model.fbx`
   (11 MB), `public/models/avatar/character_girl.glb` (2.9 MB). Only
   `character.glb` and `animation.glb` are loaded. These look like
   work-in-progress avatars, so they were kept — delete if not.
7. **`components/ui/container.tsx` imports `contexts/store-admin-full-width`.**
   Works, but the naming is a leftover. Worth inlining.

## Re-running the analysis

The closure and dangling-import scripts were throwaway. If you need them again,
the approach: resolve `@/*` to `web/src/*` plus `.ts .tsx .d.ts .js .jsx .mjs
.json .mdx` and `index.*`, walk imports breadth-first from the entry points, and
diff against `git ls-files src`. Two traps: `path.resolve` returns absolute
paths while `git ls-files` is relative (mixing them silently misclassifies files
reached via relative imports), and `@/types` resolves to `src/types.d.ts`.
