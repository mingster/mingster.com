# Team facts

Product facts read by the generated team skills, which hold none themselves. This project owns this file, and project differences from `~/dotfiles/templates/agent-team/docs/agents/team.md` go in `docs/agents/team-facts.md` only. Keep the headings: the skills look values up by heading.

## Repository

* GitHub: `mingster/mingster.com`, default branch `main`.
* PRs open in: `mingster/mingster.com`.

## Worker start

* Extra `orca orchestration worker-start` flags: none.
* Role files: worker worktrees hold `.claude/agents/` and `AGENTS.md`, so relative paths work.

## Checks

* Fast (first check before a PR): `bunx biome check <edited files>` and `bun test <file>`, run in `web/`.
* App change (workers and integration): `bunx biome check <edited files>`, `bun test` and `bun run build`, run in `web/`.
* Documentation only: links, role and branch references, `git diff --check`.

## Review

* Standards checklist: `docs/agents/conventions.md`.
* Extra verifiers: none.

## Changelog

* Fragments: `changelog.d/<issue>-<slug>.md` at the repo root.

## Role facts

Project specific schemas, wrapper scripts, and domain rules per role. Keep the `### <role>` headings so roles and `agent-team.sh` find them.

### sales-marketing

* Read only data access: none. This app has no store, orders or subscriptions (see `AGENTS.md` Scope).

### secops-finops

* Read only reconciliation access: none. This app takes no payments.

### support-csm

* Support thread reader and intake wrappers: none yet. Bug intake goes to GitHub issues.

## Terminal shortcut

* `team mingster.com`.
