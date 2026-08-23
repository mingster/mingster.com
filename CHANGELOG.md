# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — 2026-08-23

### Fixed

- Port riben.life better-auth 1.7 fixes: `Account.issuer`, `nextCookies()`, OAuth `/auth/continue` hop, proxy pass-through for `/api/auth`, database OAuth state

## [Unreleased] — 2026-07-25

### Changed

- Fix MDX provider wiring under Turbopack so blog posts render headers, lists, paragraphs, and links.
- Redesign blog index as a year-grouped editorial archive with previews and thumbnails.
- Render Markdown (headers/lists/GFM) in VirtualExperience chat replies; prompt Gemini to use Markdown for structured answers.
- Strip mingster.com down to auth, VirtualExperience, and blog; trim Prisma schema and unused store/commerce code.
- Pin better-auth and related plugins to 1.6.14.
- Tune `deploy.sh` for 4GB hosts (`NEXT_BUILD_LOW_MEMORY=1`, 2560MB heap).
- Fix auth route static params (`authView`), restore visible light-theme borders, and add media helpers.
