# Project Memory: mingster.com

## Package Manager
- **Bun only** — never npm or yarn. Commands: `bun install`, `bun add`, `bun run`
- Dev server: `bun run dev` on port **3002** (run from `web/`)

## Critical: NO mingster.backbone
- `mingster.backbone` is **NOT** available in this project
- Always use local imports from `@/components/`, `@/lib/`, `@/utils/`
- UI components: `@/components/ui/button`, `@/components/ui/dialog`, etc.
- DataTable: `import { DataTable } from "@/components/data-table"`
- Toast: `import { toast } from "@/components/ui/use-toast"`
- Loader: `import { Loader } from "@/components/loader"`
- Utils: `import { cn } from "@/lib/utils"`

## Server Actions
- Location: `src/actions/` organized by domain (admin/, geo/, mail/, store/, sysAdmin/, user/)
- Naming: `verb-object.ts` + `verb-object.validation.ts`, exported as `verbObjectAction`
- Action clients from `@/utils/actions/safe-action`:
  - `baseClient` — public (no auth)
  - `userRequiredActionClient` — any authenticated user
  - `storeActionClient` — store members (requires storeId bound arg)
  - `adminActionClient` — admin role only
- Zod imports: `import { z } from "zod/v4"`

## CRUD Pattern (Modern Client State)
- `page.tsx` — server component, fetches data, passes to client component
- `components/client-[object].tsx` — client component with `useState` for data array
- `components/edit-[object].tsx` — dialog with react-hook-form + Zod + server action
- **NO `router.refresh()`** for client state — update local state directly after mutations
- Callbacks: `onCreated`, `onUpdated`, `onDeleted` passed down from client component
- Reference: `src/app/sysAdmin/sysmsg/`

## Database
- Multiple Prisma databases; schema at `web/prisma/schema.prisma`
- Prisma client singleton: `sqlClient` from `@/lib/prismadb`
- After schema changes: `bun run sql:generate` then `bun run dbpush`
- BigInt values: convert with `transformBigIntToNumbers(data)` before sending to client

## Logging
- Always `import logger from "@/lib/logger"` — never `console.log`
- Pattern: `logger.info("message", { metadata: { key: val }, tags: ["tag"] })`
- Error pattern: `err instanceof Error ? err.message : String(err)`

## Tailwind v4
- CSS-first config via `@theme` directive, not `tailwind.config.js`
- `@import "tailwindcss"` instead of `@tailwind` directives
- Breaking: `shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden`

## Auth
- Better Auth; server: `src/lib/auth.ts`, client: `src/lib/auth-client.ts`
- Roles: `user`, `owner`, `staff`, `storeAdmin`, `admin`
- Session in server components: `auth.api.getSession({ headers: await headers() })`

## i18n
- Default locale: `tw`; others: `en`, `jp`
- Server: `import { getT } from "@/app/i18n"`
- Client: `import { useTranslation } from "react-i18next"`

## Forms
- react-hook-form + Zod; `toastError`/`toastSuccess` from `@/components/Toast`
- Check `result?.serverError` after server action calls

## Data Fetching
- Server components: direct Prisma
- Client components: SWR (`useSWR<T>("/api/...")`)
- Mutations: always Server Actions

## Context7
- Use Context7 MCP automatically for library/API docs without being asked

## TypeScript
- Prefer `interface` over `type`
- Avoid enums; use const maps
- Named exports preferred over default
- `satisfies` operator for type validation
