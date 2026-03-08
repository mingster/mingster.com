# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`mingster.com` is a Next.js 15 web platform. The repository is a monorepo:

```
mingster.com/
├── web/          # Main Next.js application (all active development happens here)
├── doc/          # Project documentation
└── bin/          # Utility scripts
```

All development work is done inside `web/`. The dev server runs on port **3002**.

## Commands (run from `web/`)

```bash
bun install                  # Install dependencies
bun run dev                  # Start dev server (http://localhost:3002)
bun run build                # Build (runs postinstall/prisma generate first)
bun run lint                 # Run Next.js lint + ESLint fix
bun run format               # Biome format src/
bun run bio_lint             # Biome check + fix src/

# Database
bun run sql:generate         # Generate Prisma client
bun run dbpush               # Push schema to DB (prisma db push)
bun run install:data         # Seed initial data
bun run db:close-connections # Close stale DB connections

# Commits (use conventional commits)
bun run commit               # Interactive commit via git-cz
```

**Package manager: Bun only.** Never use npm or yarn. Always `bun add`, `bun install`, `bun run`.

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL via Prisma ORM (`web/prisma/schema.prisma`)
- **Auth**: Better Auth (`src/lib/auth.ts` server, `src/lib/auth-client.ts` client)
- **UI**: Tailwind CSS v4, shadcn/ui components (Radix UI primitives)
- **Payments**: Stripe (via `@better-auth/stripe`)
- **i18n**: i18next with locales: `tw` (default), `en`, `jp`
- **Logging**: Pino (`src/lib/logger.ts`)
- **Forms**: react-hook-form + Zod validation
- **Server actions**: `next-safe-action`

### App Router Structure

```
src/app/
├── (root)/          # Public pages: about, privacy, terms, signIn
├── account/         # User account & subscription
├── api/             # API routes (auth, chat, common, og)
├── auth/            # Auth pages ([authView])
├── blog/            # Blog with MDX
├── dashboard/       # User dashboard (sidebar layout)
├── qr-generator/    # QR code tool
├── sysAdmin/        # System admin (requires admin role)
├── layout.tsx       # Root layout with providers
└── i18n/            # i18n settings and locale files
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Better Auth server config (plugins, social providers, roles) |
| `src/lib/auth-client.ts` | Client-side auth hooks (`authClient`, `useSession`) |
| `src/lib/prismadb.ts` | Prisma singleton (`sqlClient`) |
| `src/utils/actions/safe-action.ts` | Action clients (see below) |
| `src/lib/logger.ts` | Structured Pino logger |
| `prisma/schema.prisma` | Database schema |

## Patterns and Conventions

### Server Actions

Actions live in `src/actions/` organized by domain (`admin/`, `sysAdmin/`, `store/`, `user/`, `mail/`, `geo/`).

**Naming**: `verb-object.ts` / `verb-object.validation.ts`, exported as `verbObjectAction`.

Use the appropriate client from `src/utils/actions/safe-action.ts`:

```typescript
// Public (no auth)
import { baseClient } from "@/utils/actions/safe-action";

// Any authenticated user
import { userRequiredActionClient } from "@/utils/actions/safe-action";

// Store members (owner/storeAdmin/staff) — requires storeId bound arg
import { storeActionClient } from "@/utils/actions/safe-action";

// Admin role only
import { adminActionClient } from "@/utils/actions/safe-action";
```

Validation schemas use Zod and live alongside the action file:
```typescript
// update-system-message.validation.ts
import { z } from "zod";
export const updateSystemMessageSchema = z.object({ id: z.string(), ... });
export type UpdateSystemMessageInput = z.infer<typeof updateSystemMessageSchema>;
```

### CRUD Pattern (Admin Pages)

The standard pattern for admin CRUD resources:

1. **`page.tsx`** — Server component: fetch data, pass to client component
2. **`components/client-[object].tsx`** — Client component: holds `useState` array of data, defines columns, passes `onUpdated`/`onCreated`/`onDeleted` callbacks
3. **`components/edit-[object].tsx`** — Dialog with react-hook-form + Zod; calls server action; invokes callback to update parent state

**Do NOT use `router.refresh()` to sync client state** — update local state directly after mutations.

Reference implementation: `src/app/sysAdmin/sysmsg/`

### Data Fetching

- **Server components**: fetch directly with Prisma
- **Client components**: use SWR for GET requests (`useSWR<T>("/api/...")`)
- **Mutations**: always use Next.js Server Actions

### Logging

Always use `logger` from `@/lib/logger`, never `console.log`.

```typescript
import logger from "@/lib/logger";

logger.info("Order created", {
  metadata: { orderId, userId, amount },
  tags: ["order", "success"],
});

logger.error("Payment failed", {
  metadata: {
    orderId,
    error: err instanceof Error ? err.message : String(err),
  },
  tags: ["payment", "error"],
});
```

### Forms

```typescript
// react-hook-form + Zod
const form = useForm<InputType>({
  resolver: zodResolver(schema),
  defaultValues: item,
});

// Error handling in submit
const result = await someAction(data);
if (result?.serverError) {
  toastError({ description: result.serverError });
  return;
}
toastSuccess({ description: "Saved!" });
```

### TypeScript

- Prefer `interface` over `type`
- Avoid enums; use const maps
- Use `satisfies` operator for type validation
- Favor named exports over default exports

### Imports

Use `@/` alias for all src imports. Import order: external deps → internal components → actions/utils → types.

```typescript
import { Button } from "@/components/ui/button";
import { someAction } from "@/actions/domain/verb-object";
import prismadb from "@/lib/prismadb";
```

## Authentication & Roles

Better Auth is configured with roles: `user`, `owner`, `staff`, `storeAdmin`, `admin`.

Social providers: Google, LINE, Apple. Also: phone/OTP, magic link, passkeys, anonymous.

Access guards in server components:
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user) redirect("/signIn");
```

## i18n

Default locale is `tw`. Locale files: `src/app/i18n/locales/{tw,en,jp}/translation.json`.

In server components:
```typescript
import { getT } from "@/app/i18n";
const { t } = await getT(locale, "translation");
```

In client components:
```typescript
import { useTranslation } from "react-i18next";
const { t } = useTranslation("translation");
```

## Database

Schema: `web/prisma/schema.prisma`. After schema changes:
```bash
bun run sql:generate  # regenerate client
bun run dbpush        # push to DB
```

The Prisma client singleton is `sqlClient` from `@/lib/prismadb`.

BigInt values from Prisma must be converted before passing to client components: `transformBigIntToNumbers(data)`.
