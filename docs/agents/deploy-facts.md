# Deploy facts

Product facts the shared `deploy` skill reads. The skill is generated from dotfiles and holds no hosts, branches or commands; this file is owned by this project. Keep the headings: the skill looks values up by heading.

## Repository

* GitHub: `mingster/mingster.com`. Development branch: `main`.
* Decision record: none. Production setup is described in `docs/DEPLOYMENT.md`.

## Components

One row per deployable component. With one row, `/deploy` takes no component argument.

| Component | Folder | Stage branches | Status contexts | local | staging | production | Smoke check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| app | `web/` | `main` (production pulls `main`) | `deploy/local`, `deploy/production` | worktree on the Mac | none | `mx2.mingster.com` (PM2 process `mingster.com`, `/var/www/mingster.com`) | qa-sdet |

## Production window

* None set. The box also runs Mail-in-a-Box, so a build there competes with mail for 4GB RAM.
* One deploy at a time: the single host `mx2.mingster.com`.

## local

* Worktree path: `.claude/worktrees/deploy-local`.
* Env file: `web/.env.local`. Allowed databases: localhost only. Masking tool: none.
* Port that must be free: `3002`.
* Steps, in order: `bun install`, `bun run sql:generate`, `bunx biome check src`, `bun test`, `bun run build`.

## staging

* None. There is no staging host; `main` goes straight to production after the local pass.

## production

* Production data: real user accounts (auth). Every production deploy needs the owner's go.
* Deploy command: `ssh mx2.mingster.com 'cd /var/www/mingster.com && bash web/bin/deploy.sh'` (pulls `main` with `--ff-only`, builds on the box, reloads PM2). Overrides allowed only on the user's word: `DB_PUSH=1`, `MAX_OLD_SPACE=<MB>`.
* Host check that it runs the commit: `ssh mx2.mingster.com 'git -C /var/www/mingster.com rev-parse HEAD'`.
* Schema diff for the summary: `git diff <deployed sha>..<new sha> -- web/prisma/schema.prisma`.
* What a deploy interrupts: a short PM2 reload of the app; the build loads the box for several minutes. Full guide: `docs/DEPLOYMENT.md`.

### Production prerequisites

Schema changes ship with `DB_PUSH=1` on the deploy command (`prisma db push`), only on the owner's go. There are no SQL apply or secret scripts yet; production `.env` lives only on the box and is never synced.

* Production SQL apply script: none. The only schema path is `DB_PUSH=1` on the deploy command.
* Production secret script: none. Only the owner edits `/var/www/mingster.com/web/.env` on the box; agents never read or write it.
* Approval scope that allows both: the owner's go in chat for one full commit sha, naming `DB_PUSH=1` when the schema changed.
* Migration login: the app's own database login from the box's `.env` (no separate migration login). Preflight: `git diff <deployed sha>..<new sha> -- web/prisma/schema.prisma` must show no dropped or renamed columns, or the owner must approve the data loss.
* Ledger: none. `prisma db push` keeps no history; the schema diff in the release summary is the record.
* Backup before the first write: on the box, `pg_dump -Fc` of the database named in `.env` to `/var/backups/mingster.com/<sha>.dump`, checked with `pg_restore --list`. A failed backup stops the run.
* One time user dry run: not done yet. The owner runs the backup command above once and records the date here.

## Owner approval

* **Host preflight** before any production host job (promote, SQL, secrets, rollback, any ssh to a production host): read only the scope and expiry of the user approval and check it has the scope of the job (`host` for host jobs, `promote` for a promotion, `rollback` for a rollback) and covers the expected job length. Production holds real user accounts, so every deploy, rollback, schema push and host job needs the owner's go. If it is missing, expired, another scope or too short, stop before the first ssh and ask the coordinator for a fresh user approval of that scope. The expiry itself stays.
* Production needs the owner's go for each release and each rollback.
* Owner approval script: none. The owner's go in chat is the approval.

## Host status

* `web/bin/probe-server.sh` (read only: RAM, ports, PM2 status) and `ssh mx2.mingster.com 'git -C /var/www/mingster.com rev-parse HEAD'`.

## Rollback

* `git revert <bad sha>` on a branch, merge to `main` through a PR, then run the production deploy command. No force push.
* The schema blocks this when the bad release dropped or renamed columns with `DB_PUSH=1`: restore `/var/backups/mingster.com/<sha>.dump` with `pg_restore` first, on the owner's go.

## Production host facts

Refs #42. Nothing in this file holds a secret or a connection string.

* Host: mx2.mingster.com, reached with `ssh root@mx2.mingster.com` (host key pinned by the owner). The box rate limits ssh: one connect works, a quick second is refused for about 2 minutes, so batch work into few sessions.
* App: `/var/www/mingster.com` on branch main, served by pm2 as `mingster.com` on port 3002 behind nginx (`/etc/nginx/sites-available/mingster.com`, which sets X-Real-IP and X-Forwarded-For).
* Deploy log: `/root/db-backups/deploy-<sha>.log`. Add `DB_PUSH=1` only when `prisma/schema.prisma` changed.
* Production database: the production database (Prisma Postgres), reached from mx2 with the URL in the box's own `/var/www/mingster.com/web/.env`. Never print it or copy `.env` off the box.
* Backup before any `DB_PUSH=1`: `pg_dump -Fc` to `/root/db-backups/` on mx2, size above 0, `pg_restore -l` lists entries.
* `prisma db push` runs without `--accept-data-loss`. A data loss warning stops the deploy until the owner decides.
* Smoke on https://mingster.com (not mx2, which is the mail host): `/`, `/signIn`, `/api/auth/get-session` return 200, a signed-out POST to `/api/chat` returns the sign-in reply, `/api/log-write` with no Origin returns 403, a signed-out `/sysAdmin/ai-models` redirects to `/signIn`, pm2 online, no new error log lines except the restart pair.

## Development database

* Host: miniu (LAN, Postgres 18, port 5432). The laptop (192.168.2.5) is allowed by `pg_hba.conf` with password login.
* Database and role: `mingster_local`, owned by role `mingster_local`. Created 2026-11-22 on the empty server, then seeded with `bun run dbpush` (no data loss flag) and `bun run install:data --skip-stripe`.
* The connection string lives only on miniu, at `/home/mtsai/.mingster-dev/database-url` (mode 600, directory 700). Only `web/.env.local` is kept locally, and its `DATABASE_URL` points at this database. Never print it.
* The laptop `web/.env.local` `DATABASE_URL` must show host `miniu` before any schema command. A `bun run dbpush` against the production database is a production push.
* Seed order: `bun run dbpush`, then `bun run install:data`, against miniu only.
* Left alone: an older database and role `mingster_dev` on miniu (115 tables from the old schema, empty `user` table). The owner can drop both if unused.
