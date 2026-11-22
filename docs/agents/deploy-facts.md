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
* Env file: `web/.env`. Allowed databases: localhost only. Masking tool: none.
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
