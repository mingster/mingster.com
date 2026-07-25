#!/usr/bin/env bash
#
# deploy.sh — on-box deploy for mx2.mingster.com (~4GB RAM + Mail-in-a-Box).
#
# Run this ON the target machine (not from your laptop):
#   cd /var/www/mingster.com && web/bin/deploy.sh
#   # or from web/:  bin/deploy.sh
#
# Flow (mirrors pstv_web2 bin/deploy-win.sh, with PM2 instead of IIS):
#   1. git pull --ff-only          (before install/build mutates the tree)
#   2. Clean build artifacts
#   3. bun install
#   4. git restore .               (undo bun.lock / package churn)
#   5. bun install --frozen-lockfile
#   6. low-memory next build
#   7. pm2 reload (or start)
#
# Usage:
#   web/bin/deploy.sh
#   MAX_OLD_SPACE=3072 web/bin/deploy.sh   # raise/lower Node heap cap (MB)
#   DB_PUSH=1          web/bin/deploy.sh   # also run `prisma db push`
#
# Config (override via env):
#   PM2_NAME       pm2 process name                  (default: mingster.com)
#   MAX_OLD_SPACE  Node heap cap in MB for the build (default: 2560)
#   BUILD_CMD      build command                     (default: bun run build)
#
set -euo pipefail

# --- config -----------------------------------------------------------------
PM2_NAME="${PM2_NAME:-mingster.com}"
MAX_OLD_SPACE="${MAX_OLD_SPACE:-2560}"
BUILD_CMD="${BUILD_CMD:-bun run build}"
DB_PUSH="${DB_PUSH:-0}"

# App root: this script lives in web/bin/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$WEB_DIR/.." && pwd)"

log()  { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# Non-interactive shells may not have bun/pm2 on PATH.
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$HOME/.local/bin:/usr/local/bin:$PATH"

command -v git >/dev/null || die "git not found on PATH"
command -v bun >/dev/null || die "bun not found on PATH ($PATH)"
command -v pm2 >/dev/null || die "pm2 not found on PATH ($PATH)"

# Don't leave multi-GB core dumps if the build is OOM-killed.
ulimit -c 0

log "Starting on-box deploy"
log "  repo:  ${REPO_ROOT}"
log "  web:   ${WEB_DIR}"
log "  pm2:   ${PM2_NAME}"
log "  heap:  ${MAX_OLD_SPACE}MB"
echo ""

# --- 1. pull latest before any local install/build mutates the tree ---------
log "Pulling latest from git (repo root: ${REPO_ROOT})..."
cd "$REPO_ROOT"
git pull --ff-only
ok "Repo up to date"
echo ""

# --- 2. clean ----------------------------------------------------------------
log "Cleaning build artifacts..."
cd "$WEB_DIR"
rm -rf .next node_modules .swc prisma/generated
ok "Cleaned .next / node_modules / .swc / prisma/generated"
echo ""

# --- 3. install (may rewrite bun.lock / package files) ----------------------
log "Installing dependencies..."
bun install
ok "Dependencies installed"
echo ""

# --- 4. restore tracked files (undo lockfile churn from step 3) -------------
log "Restoring tracked files to last commit (undo bun.lock etc.)..."
cd "$REPO_ROOT"
git restore .
ok "Working tree restored to HEAD"
echo ""

# --- 5. re-install from restored lockfile -----------------------------------
log "Re-installing from restored lockfile (--frozen-lockfile)..."
cd "$WEB_DIR"
bun install --frozen-lockfile
ok "Frozen lockfile install done"
echo ""

# --- 6. build (low-memory for 4GB box) --------------------------------------
# Known-good on mx2:
#   NEXT_BUILD_LOW_MEMORY=1 NODE_OPTIONS="--max-old-space-size=2560" bun run build
log "Building (${BUILD_CMD}, NEXT_BUILD_LOW_MEMORY=1, heap ${MAX_OLD_SPACE}MB)..."
NEXT_BUILD_LOW_MEMORY=1 \
  NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=${MAX_OLD_SPACE}}" \
  ${BUILD_CMD}
ok "Build completed"
echo ""

if [ "$DB_PUSH" = "1" ]; then
  log "prisma db push..."
  bun run sql:dbpush
  ok "Schema pushed"
  echo ""
fi

# --- 7. reload PM2 ----------------------------------------------------------
log "Reloading PM2 (${PM2_NAME})..."
if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  pm2 reload "${PM2_NAME}" --update-env
else
  log "First run — starting PM2 process"
  pm2 start bun --name "${PM2_NAME}" --cwd "${WEB_DIR}" -- start
fi
pm2 save
pm2 status "${PM2_NAME}"

echo ""
ok "Deployment completed successfully"
log "Tail logs:  pm2 logs ${PM2_NAME} --lines 50"
