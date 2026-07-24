#!/usr/bin/env bash
#
# deploy.sh — sync source to the server and build there (low-memory), then reload PM2.
#
# The production box (mx2.mingster.com, ~4GB RAM, also runs Mail-in-a-Box) builds
# the app itself with a capped Node heap — no swap file needed. Building on the box
# (rather than shipping a prebuilt .next from your Mac) avoids every cross-platform
# pitfall: Turbopack runs natively, the Prisma engine is Linux-native, and external
# module hashes match the box's own node_modules.
#
# Flow (runs from your workstation):
#   1. rsync the app source to the box  (no node_modules / .next / .env)
#   2. on the box: bun install → build with --max-old-space-size cap → pm2 reload
#
# Usage:
#   web/bin/deploy.sh                 # sync, build on box, reload PM2
#   MAX_OLD_SPACE=3072 web/bin/deploy.sh   # raise/lower the Node heap cap (MB)
#   DB_PUSH=1   web/bin/deploy.sh     # also run `prisma db push` on the box
#   DRY_RUN=1   web/bin/deploy.sh     # rsync --dry-run, no remote build/reload
#
# Config (override via env):
#   DEPLOY_USER    ssh user on the server           (default: root)
#   DEPLOY_HOST    server hostname                   (default: mx2.mingster.com)
#   DEPLOY_PATH    app dir on server (the web/ dir)  (default: /var/www/mingster.com/web)
#   PM2_NAME       pm2 process name                  (default: mingster.com)
#   SSH_PORT       ssh port                          (default: 22)
#   MAX_OLD_SPACE  Node heap cap in MB for the build (default: 2048)
#   BUILD_CMD      build command run on the box      (default: bun run build)
#
set -euo pipefail

# --- config -----------------------------------------------------------------
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-mx2.mingster.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/mingster.com/web}"
PM2_NAME="${PM2_NAME:-mingster.com}"
SSH_PORT="${SSH_PORT:-22}"
MAX_OLD_SPACE="${MAX_OLD_SPACE:-2048}"
BUILD_CMD="${BUILD_CMD:-bun run build}"

DB_PUSH="${DB_PUSH:-0}"
DRY_RUN="${DRY_RUN:-0}"

# web/ is the parent of this script's bin/ directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
SSH="ssh -p ${SSH_PORT}"

log()  { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v rsync >/dev/null || die "rsync is required on your workstation"
cd "$WEB_DIR"

# --- 1. sync source to the server -------------------------------------------
# Ship only source. node_modules, .next and prisma/generated are (re)built on the
# box so all native binaries + Turbopack external hashes are the box's own. .env
# stays on the server and is never overwritten.
RSYNC_OPTS=(-az --delete --human-readable
  --exclude ".git"
  --exclude "node_modules"
  --exclude ".next"
  --exclude "prisma/generated"
  --exclude ".env"
  --exclude ".env.*"
  --exclude "*.log"
  --exclude "core.*"
)
[ "$DRY_RUN" = "1" ] && RSYNC_OPTS+=(--dry-run) && log "DRY_RUN=1 — no files will change on the server"

log "Ensuring remote path exists: ${DEPLOY_PATH}"
[ "$DRY_RUN" = "1" ] || $SSH "$SSH_TARGET" "mkdir -p '${DEPLOY_PATH}'"

log "Syncing source → ${SSH_TARGET}:${DEPLOY_PATH}"
rsync "${RSYNC_OPTS[@]}" -e "$SSH" \
  "$WEB_DIR"/ "${SSH_TARGET}:${DEPLOY_PATH}/"
ok "Source synced"

if [ "$DRY_RUN" = "1" ]; then
  ok "Dry run complete — nothing built or restarted."
  exit 0
fi

# --- 2. install + build (low-memory) + reload on the server -----------------
REMOTE_DB_PUSH=""
[ "$DB_PUSH" = "1" ] && REMOTE_DB_PUSH='echo "▸ prisma db push"; bun run sql:dbpush;'

log "Installing + building on ${DEPLOY_HOST} (heap cap ${MAX_OLD_SPACE}MB) — this can take a few minutes"
# shellcheck disable=SC2087
$SSH "$SSH_TARGET" bash -euo pipefail <<REMOTE
  # Non-interactive ssh does not source ~/.bashrc, so put bun/pm2 on PATH.
  export BUN_INSTALL="\${BUN_INSTALL:-\$HOME/.bun}"
  export PATH="\$BUN_INSTALL/bin:\$HOME/.local/bin:/usr/local/bin:\$PATH"
  command -v bun >/dev/null || { echo "bun not found on server PATH (\$PATH)" >&2; exit 127; }

  # Don't leave multi-GB core dumps if the build is OOM-killed.
  ulimit -c 0

  cd "${DEPLOY_PATH}"

  echo "▸ bun install --frozen-lockfile"
  bun install --frozen-lockfile

  # Build on the box. Cap the Node heap so a 4GB box builds without a swap file.
  # \`bun run build\` runs postinstall (prisma generate for Linux + patch) then next build.
  echo "▸ ${BUILD_CMD}  (NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE})"
  NODE_OPTIONS="\${NODE_OPTIONS:---max-old-space-size=${MAX_OLD_SPACE}}" ${BUILD_CMD}

  ${REMOTE_DB_PUSH}

  if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
    echo "▸ pm2 reload ${PM2_NAME}"
    pm2 reload "${PM2_NAME}" --update-env
  else
    echo "▸ pm2 start (first run)"
    pm2 start bun --name "${PM2_NAME}" --cwd "${DEPLOY_PATH}" -- start
    pm2 save
  fi
  pm2 status "${PM2_NAME}"
REMOTE

ok "Deployed. Tail logs with:  ${SSH} ${SSH_TARGET} 'pm2 logs ${PM2_NAME} --lines 50'"
