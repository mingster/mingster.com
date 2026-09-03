# Code conventions (mingster.com)

Patterns that apply when writing specific kinds of code. Not loaded every session.
Read the relevant section before writing code of that kind.

## CRUD pattern (admin pages)

1. **`page.tsx`** — Server component: fetch data, pass to client component
2. **`components/client-[object].tsx`** — Client component: holds `useState` array, defines columns, passes callbacks
3. **`components/edit-[object].tsx`** — Dialog with react-hook-form + Zod; calls server action; invokes callback to update parent state

Reference: `src/app/sysAdmin/sysmsg/`

## Data fetching

- **Server components:** fetch directly with Prisma
- **Client components:** SWR for GETs (`useSWR<T>("/api/...")`)
- **Mutations:** always server actions

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
