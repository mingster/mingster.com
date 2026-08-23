# OAuth first sign-in (session cookie)

**Date:** 2026-08-23
**Status:** Active
**Related:** [BETTER-AUTH-ACCOUNT-ISSUER.md](./BETTER-AUTH-ACCOUNT-ISSUER.md)

## Symptom

Google / LINE / Apple OAuth appears to succeed, but the first attempt leaves the user on the sign-in form. A second attempt works.

## Causes

1. **`proxy.ts` mutated `NextResponse.next()` for `/api/auth/*`** (extra headers / CORS). Next.js can drop the Better Auth `Set-Cookie` on the OAuth 302, so the session exists in the DB but the browser never stores it.
2. **Missing `nextCookies()`** as the last Better Auth plugin — required so Next.js persists cookies from auth responses.
3. **OAuth `callbackURL` of `/account` is a session-gated RSC.** The session cookie is `Set-Cookie` on `/api/auth/callback/{provider}` then the browser follows a 302 to `/account`. That follow-up is still in the **cross-site OAuth redirect chain**, so Chrome/Safari often omit the **newly-set** SameSite=Lax cookie. `/account` sees no session and redirects to `/signIn`.

## Fix

- Pass `/api/auth` through proxy unmodified (Apple `form_post` still converted first).
- `nextCookies()` last in `web/src/lib/auth.ts` plugins.
- Post-auth dest remains `/account` (`resolveOAuthCallbackUrl`). Better Auth `callbackURL` is **`/auth/continue?next=…`** via `wrapOAuthCallbackUrl` — a client page that waits for same-origin `get-session`, then full-navigates to `next`.
- `/signIn` auto-continues when a session already exists (recovers the `/account` bounce).
