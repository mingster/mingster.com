# Dependency removal candidates

Generated during the strip-to-three-features cleanup. **`package.json` was not
modified** — every entry below needs a `bun install` + `bun run build` to confirm,
and that could not be run in the cleanup environment.

Work through the tiers in order. After each tier:

```bash
cd web
bun install
bun run sql:generate
bun x tsc --noEmit
bun run build
```

## Before you start

`node_modules` is currently installed from a **stale, downgraded** dependency set
(`better-auth@1.6.14` while `package.json` asks for `^1.6.25`). That mismatch is the
sole cause of the 14 remaining typecheck errors. Run `bun install` first — those
should drop to zero before you evaluate anything here.

---

## Tier 1 — tied to a deleted feature, high confidence

| Package | Was used by |
|---|---|
| `@aws-sdk/client-s3` | product image storage (`lib/product-images/s3-storage`) |
| `@line/liff` | LIFF storefront (`lib/liff`, `providers/liff-provider`) |
| `@stripe/react-stripe-js` | checkout UI. **Keep the server `stripe` package** — `lib/stripe/config` still uses it |
| `@tanstack/react-table` | store/sysAdmin data tables |
| `@dnd-kit/core`, `@dnd-kit/modifiers`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | `datatable-draggable` |
| `socket.io-client` | store-admin realtime (`providers/socket-provider`) |
| `@uiw/react-md-editor` | `components/editor/markdown-mdx-editor` |
| `embla-carousel-react` | product carousel |
| `react-image-file-resizer` | product image upload |
| `flatpickr` | business-hours picker |
| `react-timer-hook` | kitchen/front-desk order timers |
| `react-resizable-panels` | store-admin split panes |
| `react-ui-scrollspy` | storefront menu scrollspy |
| `typewriter-effect` | storefront marketing |
| `react-player` | product video |
| `next-qrcode`, `qrcode`, `@types/qrcode` | superseded by `qr-code-styling`, which `lib/qr/generator` uses |
| `@google-cloud/recaptcha-enterprise` | `lib/recaptcha-verify` (deleted; better-auth's captcha plugin verifies server-side) |
| `react-google-recaptcha`, `@types/react-google-recaptcha` | superseded by `@wojtekmaj/react-recaptcha-v3` in `components/auth/recaptcha-v3` |

## Tier 2 — likely unused, verify by grep first

| Package | Note |
|---|---|
| `zustand` | check no surviving store; `hooks/use-cart` etc. are gone |
| `framer-motion` | `lib/motion` deleted — confirm no VE component animates with it |
| `usehooks-ts` | confirm no surviving hook re-exports it |
| `vaul` | drawer primitive; only if no `components/ui/drawer` remains |
| `crypto-js`, `@types/crypto-js` | `lib/crypto-util` deleted |
| `bcrypt` | better-auth hashes passwords itself |
| `axios` | confirm nothing left uses it over `fetch` |
| `uuid`, `@types/uuid` | `crypto.randomUUID()` is used instead |
| `date-fns-tz` | `utils/datetime-utils` survives — check which tz helper it uses |
| `react-day-picker` | only if no `components/ui/calendar` remains |
| `@headlessui/react` | template leftover |
| `nodemailer`, `@types/nodemailer` | **keep if you add the sendmail cron** that drains `emailQueue` |
| `remark-html` | blog uses MDX + `rehype-highlight`; confirm |
| `nextjs-current-url` | confirm |
| `nuqs` | confirm no surviving search-param hook |
| Unused `@radix-ui/*` | `alert-dialog`, `aspect-ratio`, `avatar`, `checkbox`, `collapsible`, `hover-card`, `icons`, `navigation-menu`, `progress`, `radio-group`, `toggle`, `toggle-group`, `tooltip` — each maps to a `components/ui/*` file; delete the wrapper and the dep together |

## Do NOT remove

These looked unused to import-scanning but are wired in via config or tooling:

- `postcss`, `@tailwindcss/postcss`, `autoprefixer` — `postcss.config.mjs`
- `pg` — Prisma pg adapter, referenced in `next.config.ts` / `prisma.config.ts`
- `pino-pretty` — logger transport, resolved by name at runtime
- `@mdx-js/loader`, `@mdx-js/react` — `next.config.ts` MDX pipeline
- `react-dom` — peer of React
- `i18next-resources-for-ts` — i18n type generation
- All of `devDependencies` tooling: `typescript`, `@types/*`, `@biomejs/biome`,
  `eslint*`, `husky`, `lint-staged`, `git-cz`, `commitlint`, `shadcn`,
  `@gltf-transform/cli` (used by `bun run compress:character`)

## Kept deliberately

`three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` — VirtualExperience.
`stripe`, `@better-auth/stripe` — the Stripe auth plugin is retained in `lib/auth.ts`.
`@daveyplate/better-auth-ui` — powers `/auth/[authView]` and the account provider cards.
