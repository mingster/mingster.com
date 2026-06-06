# Agent instructions (mingster.com)

mingster.com — Next.js 15 web platform. Main app: `web/`. Run all commands from `web/`.

## Workspace layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js app (`src/`, `prisma/`, `package.json`) |
| `doc/` | Project documentation |
| `bin/` | Utility scripts |

## Cross-project context (Obsidian)

Tech patterns and project docs live in the Obsidian vault (`~/Documents/Obsidian`). Fetch on
demand via the `obsidian` MCP — do not load everything upfront.

| What | Entry point |
|------|-------------|
| Cross-project tech patterns | `Tech Notes Index.md` |
| This project's overview | `Mingster Com.md` |
| All active projects | `Projects Index.md` |

Quick reference notes also at `~/.claude/notes/` (stack, nextjs, prisma, next-safe-action).
Add new learnings: `~/dotfiles/script/contribute-to-agents.sh <topic> "note"`

## Commands (run from `web/`)

| Script | Purpose |
|--------|---------|
| `bun run dev` | Dev server port 3002 |
| `bun run build` | Build (runs prisma generate via postinstall) |
| `bun run lint` | Next.js lint + ESLint fix |
| `bun run format` | Biome format `src/` |
| `bun run bio_lint` | Biome check + fix `src/` |
| `bun run sql:generate` | Regenerate Prisma client after schema change |
| `bun run dbpush` | Push schema changes to DB (dev only) |
| `bun run install:data` | Seed initial data |
| `bun run commit` | Interactive commit via git-cz |

**Package manager: Bun only.** Never use npm/yarn/pnpm. Always `bun add`, `bun install`, `bun run`.

## Architecture

**Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), PostgreSQL + Prisma, Tailwind v4,
shadcn/ui, Better Auth, Pino logging, react-hook-form + Zod, next-safe-action.

**App Router** (`web/src/app/`):

| Route group | Purpose |
|-------------|---------|
| `(root)/` | Public pages: about, privacy, terms, signIn |
| `account/` | User account and subscription |
| `api/` | API routes (auth, chat, common, og) |
| `auth/` | Auth pages `[authView]` |
| `blog/` | Blog with MDX |
| `dashboard/` | User dashboard (sidebar layout) |
| `qr-generator/` | QR code tool |
| `sysAdmin/` | System admin (requires admin role) |

**Key files:**

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Better Auth server config (plugins, social providers, roles) |
| `src/lib/auth-client.ts` | Client-side auth hooks (`authClient`, `useSession`) |
| `src/lib/prismadb.ts` | Prisma singleton (`sqlClient`) |
| `src/utils/actions/safe-action.ts` | Action clients |
| `src/lib/logger.ts` | Structured Pino logger |
| `prisma/schema.prisma` | Database schema |

## Constraints

- Never `console.log` — use `logger` from `@/lib/logger` with structured `metadata`
- No `@prisma/client` in `"use client"` modules
- `components/ui/` is shadcn-only — wrap, don't edit directly
- After mutations: update local `useState` directly; do not rely on `router.refresh()` for list data
- User-facing errors: throw `SafeError`; use `getT()` from `@/app/i18n` for messages

## Prisma / datetime (critical)

All datetime fields are **BigInt epoch milliseconds** — no Prisma `DateTime`, no `@default(now())`.

```typescript
import { getUtcNowEpoch, epochToDate } from "@/utils/datetime-utils"
// persist
creationDate: getUtcNowEpoch()
// display
epochToDate(record.createdAt)
```

Before `JSON.stringify()` or sending Prisma data to the client:
```typescript
import { transformBigIntToNumbers } from "@/utils/utils"
transformBigIntToNumbers(data)
```

## Server actions

Actions live in `src/actions/` by domain (`admin/`, `sysAdmin/`, `store/`, `user/`, `mail/`, `geo/`).
Naming: `verb-object.ts` + `verb-object.validation.ts`, exported as `verbObjectAction`.

- `storeActionClient`: first bound arg is `storeId` — do **not** include `storeId` in the Zod schema. Call as `action(storeId, { ...input })`.
- Reuse the Zod schema from `*.validation.ts` in forms — never duplicate.
- Zod v4: `import { z } from "zod"`.

| Client | Use for |
|--------|---------|
| `baseClient` | Public (no auth) |
| `userRequiredActionClient` | Any authenticated user |
| `storeActionClient` | Store members (owner/storeAdmin/staff) |
| `adminActionClient` | Admin role only |

## CRUD pattern (admin pages)

1. **`page.tsx`** — Server component: fetch data, pass to client component
2. **`components/client-[object].tsx`** — Client component: holds `useState` array, defines columns, passes callbacks
3. **`components/edit-[object].tsx`** — Dialog with react-hook-form + Zod; calls server action; invokes callback to update parent state

Reference: `src/app/sysAdmin/sysmsg/`

## Data fetching

- **Server components:** fetch directly with Prisma
- **Client components:** SWR for GETs (`useSWR<T>("/api/...")`)
- **Mutations:** always server actions

## Auth roles

Better Auth with roles: `user`, `owner`, `staff`, `storeAdmin`, `admin`.
Social providers: Google, LINE, Apple. Also: phone/OTP, magic link, passkeys, anonymous.

## i18n

Default locale: `tw`. Locale files: `src/app/i18n/locales/{tw,en,jp}/translation.json`.
Keys: **snake_case only**.

## Logging

```typescript
import logger from "@/lib/logger";
logger.info("Order created", { metadata: { orderId, userId }, tags: ["order"] });
logger.error("Payment failed", { metadata: { error: err instanceof Error ? err.message : String(err) }, tags: ["payment"] });
```

## Imports

Use `@/` alias for all `src/` imports. Order: external deps → internal components → actions/utils → types.

---

Claude Code: root `CLAUDE.md` → `@AGENTS.md`. When opened from `web/`, `web/CLAUDE.md` → `@../AGENTS.md`.
