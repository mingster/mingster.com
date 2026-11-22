# Deploy facts

Product facts the shared `deploy` skill reads. The skill is generated from dotfiles and holds no hosts, branches or commands; this file is owned by this project. Keep the headings: the skill looks values up by heading.

## Repository

* GitHub: `mingster/mingster.com`. Development branch: `main`.
* Decision record: `<ADR that set up this pipeline>`.

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

* Production SQL apply script: `<path and exact command, for example bin/apply-production-sql.sh <component> <sha> --dry-run <db> <files>>`. Dry run first, then the same command without `--dry-run`.
* Production secret script: `<path and exact command, for example bin/set-production-secret.sh <component> <sha> <KEY>>`, with its allowed keys: `<list>`.
* Approval scope that allows both: `<for example bin/owner-approve.sh promote <component> <sha> --schema --apply>`. Valid for `<minutes>`, one component and one full commit sha.
* Migration login: `<least privilege login the SQL script uses, and where its credential lives>`. Preflight that checks it before any write: `<command, or none>`.
* Ledger: `<table or file that records applied SQL files, and how a changed file is handled>`.
* Backup before the first write: `<how it is made and verified, and where it lands>`. A failed backup stops the run.
* One time user dry run: `<what the owner runs once to prove the scripts, login and backup work, and the date it passed>`.

## Owner approval

* **Host preflight** before any production host job (promote, SQL, secrets, rollback, any ssh to a production host): read only the scope and expiry of the user approval and check it has the scope of the job (`host` for host jobs, `promote` for a promotion, `rollback` for a rollback) and covers the expected job length. While production holds only test data, a non-force push of the production branch needs no user approval. A rollback is a force push and still needs the owner's go. Host, SQL and secrets jobs still do. If it is missing, expired, another scope or too short, stop before the first ssh and ask the coordinator for a fresh user approval of that scope. The expiry itself stays.
* Production needs the owner's go for each release once a real store is live. Before that, a non-force production push runs after the Playground regression passes. A production rollback still needs the owner's go.
* Owner approval script: `<path and exact command, for example bin/owner-approve.sh <component> <sha>, or none>`. The user runs it; the deploy skill gives them the exact command.

## Host status

* `<command that prints what each host runs, or none>`.

## Rollback

* `<emergency rollback steps, and when the schema blocks them>`.
