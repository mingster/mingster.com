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
| `bun run install:data` | Seed locales, platform settings, auth email templates |
| `bun run commit` | Interactive commit via git-cz |

**Package manager: Bun only.** Never use npm/yarn/pnpm. Always `bun add`, `bun install`, `bun run`.

## Architecture

**Stack:** Next.js 15 (App Router), React 19, TypeScript (strict), PostgreSQL + Prisma, Tailwind v4,
shadcn/ui, Better Auth, Pino logging, react-hook-form + Zod, next-safe-action.

**App Router** (`web/src/app/`):

| Route group | Purpose |
|-------------|---------|
| `(root)/` | Public pages: privacy, terms, signIn |
| `account/` | Profile, linked providers, passkeys, 2FA, sessions, sign out |
| `api/` | `auth`, `chat` (VE), `og` (blog), `common/get-locales`, `log-write` |
| `auth/` | Better Auth UI pages `[authView]` |
| `blog/` | Blog with MDX (content in `web/blogData/`) |
| `page.tsx` | Home — renders VirtualExperience |
| `qr-generator/` | QR tool, opened by the VE `/qrcode` slash command |

**Scope:** this app is deliberately limited to three features — **auth**,
**VirtualExperience**, and **blog**. Store, storefront, shop, checkout, payment,
reservation, notification and admin code was removed (see `doc/CLEANUP.md`).
Do not reintroduce store/tenant concepts.

**Key files:**

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Better Auth server config (plugins, social providers, roles) |
| `src/lib/auth-client.ts` | Client-side auth hooks (`authClient`, `useSession`) |
| `src/lib/prismadb.ts` | Prisma singleton (`sqlClient`) |
| `src/utils/actions/safe-action.ts` | Action clients |
| `src/lib/logger.ts` | Structured Pino logger |
| `prisma/schema.prisma` | Database schema — 18 models, auth + mail only |
| `src/components/virtual-experience/` | VE avatar, scene, chat UI |
| `src/lib/legal-content.ts` | Reads privacy/terms markdown from `public/defaults/` |

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

## Auth roles

Better Auth with roles: `user`, `owner`, `staff`, `storeAdmin`, `admin`.
Social providers: Google, LINE, Apple. Also: phone/OTP, magic link, passkeys, anonymous.

## Code conventions

`docs/agents/conventions.md` covers the CRUD pattern for admin pages, data fetching
(server components vs SWR vs actions), i18n keys, the logger call shape, and import order.

Read it before adding an admin CRUD page, fetching data in a component, adding a
user-facing string, or writing a log line.

## Agent skills

### Issue tracker

GitHub issues in this repo, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, label strings unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single context: `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

---

Claude Code: root `CLAUDE.md` → `@AGENTS.md`. When opened from `web/`, `web/CLAUDE.md` → `@../AGENTS.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Token budget

Every agent and teammate pays for what it reads, on every turn after. These hold in every session.

- Search, then read the part. Grep or Glob first, then Read with `offset` and `limit`.
- Keep command output short: pipe test, build and lint output through `tail -40`. Lint only the files you edited, never a whole repo lint with autofix (it rewrites every file). Run only the unit's listed test cases and the test files you touch, never the full suite: Regression runs only in the development pass before staging, or with the coordinator's approval recorded on the issue.
- Plan before you edit: 3 to 5 lines naming the files, the change and the test that proves it.
- Strikes. The same test failing twice after your change means stop editing: check whether a fake is stale or the test database is wrong. The same command failing 3 times in a row is a hard stop, enforced by `.claude/hooks/strikes.py`. Report the failing output and what was ruled out, and wait for the user. This is the only strike rule; role files point here.
- Use `active_run.md` (git ignored) only on a unit with more than one slice: write it at the start and when blocked.
- Hard limits: sessions compact at 200k tokens (`autoCompactWindow` in `.claude/settings.json`), and an Orca worker gets a warning at 120 turns and is stopped at 200 (`.claude/hooks/worker-budget.py`). A worker that hits the stop pushes and reports what is left.
- Report with `git diff main...HEAD --stat`, the branch name, test counts and only the failing output.

## Compact instructions

When the conversation is compacted, keep: your role, the task list and who acts next, the branch and worktree, the allowed files, the verify command, strike counts and the last failing output. Drop file contents and command output; they are re-read from the repo.
