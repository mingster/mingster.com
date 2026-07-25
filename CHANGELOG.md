# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-07-25

### Changed
- Strip mingster.com down to auth, VirtualExperience, and blog; trim Prisma schema and unused store/commerce code.
- Pin better-auth and related plugins to 1.6.14.
- Tune `deploy.sh` for 4GB hosts (`NEXT_BUILD_LOW_MEMORY=1`, 2560MB heap).
- Fix auth route static params (`authView`), restore visible light-theme borders, and add media helpers.
