# nginx on mx2.mingster.com (Mail-in-a-Box)

## Status of the 400 (resolved)

Not an nginx problem, and not a better-auth or Google credentials problem. The
root cause was the app's own middleware, `web/src/proxy.ts` (Next.js 16 renamed
`middleware.ts` to `proxy.ts`).

`POST /api/auth/sign-in/social` and `POST /api/chat` returned 400 in the browser.
The same request sent straight to the app on `127.0.0.1:3002`, bypassing nginx
entirely, returned the identical 400, because the rejection happens in the app
layer before either route handler runs.

`proxy.ts` enforces a CORS allow list on every `/api/*` request. On a miss it
returns a hardcoded `NextResponse` with status 400 and `content-type: text/plain`
(so the response is plain text, not the JSON better-auth would emit, which is why
the request looked like it never reached the handler). The allow list is built
from the `FRONTEND_URLS` env var. Every symptom follows from this:

- Both endpoints fail identically because the check is in shared middleware,
  blind to which route it fronts.
- `/api/auth/ok` returns 200 because it is a GET. Browsers send no `Origin`
  header on a plain GET, so the `if (origin)` branch is skipped. The failing
  calls are `fetch` and OAuth POSTs, which do send `Origin: https://mingster.com`.
- `trustedOrigins` already listing `https://mingster.com` is irrelevant. This 400
  fires before better-auth's own origin logic.

Why production specifically broke: the running process was not resolving
`FRONTEND_URLS` to `https://mingster.com` (a stale `.env` copy, an `.env` not in
`web/` where Next loads it, or the process not restarted after the file changed),
so the browser's real origin failed the allow list.

### The fix

`web/src/proxy.ts` now short-circuits same-origin requests before the allow list.
A request whose `Origin` hostname matches the request's own host (`x-forwarded-host`
or `host`) is always served. Comparison is hostname only, ignoring scheme, so the
X-Forwarded-Proto trap below cannot cause a false reject either. The site's own
frontend can now reach its own API regardless of how `FRONTEND_URLS` resolves;
that env var now governs only genuine cross-origin (third party) callers.

Verified locally with a deliberately wrong `FRONTEND_URLS`: same-origin
`POST /api/chat` and `POST /api/auth/sign-in/social` return 200, while a
cross-origin `Origin: https://evil.example.com` still returns 400 text/plain.

Also confirm on the box that `web/.env` (a copy of `.env.production`) actually
contains `FRONTEND_URLS=https://mingster.com`, sits in `web/`, and that the
process was restarted after it changed. That restores correct cross-origin policy;
the code fix covers same-origin regardless.

The nginx changes documented below are still worth making. They are not the fix.

## Discarded theory: X-Forwarded-Proto

Recorded because the trap is real even though it was not the cause here.

`/etc/nginx/sites-enabled/mingster.com` was copied from the working `riben.life`
config on stm36 with the certbot `listen 443 ssl` lines dropped, leaving a port
80 only block. In such a block `$scheme` evaluates to `http`, so
`proxy_set_header X-Forwarded-Proto $scheme` tells the app the request arrived
over plain HTTP. better-auth builds its base URL from that header and rejects
the browser's https Origin with a 400. The riben.life copy avoids this only
because its server block terminates TLS, making `$scheme` resolve to `https`.

That block was never live here. `nginx -T` reports
`conflicting server name "mingster.com" on 0.0.0.0:80, ignored`, because MiaB's
`conf.d/local.conf` is included first and already owns the name. nginx parsed
the file and discarded it.

## Why the riben.life pattern does not transfer

mx2 runs Mail-in-a-Box. MiaB owns ports 80 and 443 and regenerates
`/etc/nginx/conf.d/local.conf` on every update and every web config change.
`conf.d` is included before `sites-enabled`, so a `sites-enabled` block with
the same `server_name` is a conflicting server name that nginx warns about and
then ignores. Editing `local.conf` directly works until the next update wipes
it.

Two locations persist across updates:

- `/home/user-data/www/<domain>.conf`, included inside the generated server
  block for that domain
- `/home/user-data/www/custom.yaml`, the supported mechanism, which handles
  root level proxies and redirects

## Files in this repo

| Repo file | Server path |
| --- | --- |
| `doc/nginx/mingster.com.conf` | `/home/user-data/www/mingster.com.conf` |

This is the only nginx artifact the box uses. It is a small snippet of
directives (timeouts, `client_max_body_size`) that MiaB injects into the
server block it generates. The reverse proxy to `127.0.0.1:3002` is set up in
`/home/user-data/www/custom.yaml`, and MiaB owns TLS termination and the
forwarded headers through its own template. There is no `upstream`, no `map`,
no `location`, and no `sites-enabled` file in the working setup.

## Current state, mirrored from the box 2026-07-25

```bash
sudo nginx -T | grep -n "mingster.com.conf"
# 613: include /home/user-data/www/mingster.com.conf;  (inside the 443 block)
# also warns: conflicting server name "mingster.com" on 0.0.0.0:80, ignored
```

The `sites-enabled/mingster.com` file is shadowed and does nothing but emit
that warning. Delete it:

```bash
sudo rm /etc/nginx/sites-enabled/mingster.com
sudo nginx -t && sudo systemctl reload nginx
```

## To edit the snippet

Change `doc/nginx/mingster.com.conf`, copy it to the server path above, then:

```bash
sudo /root/mailinabox/tools/web_update
sudo nginx -t && sudo systemctl reload nginx
```

Do not add `upstream`, `map`, or `location` blocks. This file is included
inside an existing server block: an `upstream` is http-context and fails to
parse, and a second `location /` collides with MiaB's generated one.

## The 400 is not an nginx problem

Set regardless, because it removes header-derived origin guessing:

```
BETTER_AUTH_URL=https://mingster.com
```

But the sign-in 400 reproduces against `127.0.0.1:3002` directly, with nginx
out of the path, so no nginx change fixes it. The root cause was the `proxy.ts`
CORS gate, documented under "Status of the 400 (resolved)" above. It was not
`socialProviders` in `src/lib/auth.ts` and not the Google credentials, which the
code reads as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` anyway, and which could
never explain the identical 400 on `/api/chat` (that route touches no OAuth).
