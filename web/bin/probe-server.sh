#!/usr/bin/env bash
#
# probe-server.sh — SSH into the production box and print the facts that
# matter for deployment (RAM/swap, ports in use, Mail-in-a-Box, runtimes,
# postgres, the app's PM2 process). Read-only: it changes nothing.
#
# Usage:
#   web/bin/probe-server.sh
#   DEPLOY_USER=root DEPLOY_HOST=mx2.mingster.com web/bin/probe-server.sh
#
set -euo pipefail

DEPLOY_USER="root"
#DEPLOY_USER="${DEPLOY_USER:-$USER}"
DEPLOY_HOST="${DEPLOY_HOST:-mx2.mingster.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/mingster.com/web}"
PM2_NAME="${PM2_NAME:-mingster.com}"
SSH_PORT="${SSH_PORT:-22}"

ssh -p "${SSH_PORT}" "${DEPLOY_USER}@${DEPLOY_HOST}" \
    DEPLOY_PATH="${DEPLOY_PATH}" PM2_NAME="${PM2_NAME}" 'bash -s' <<'REMOTE'
set -u
# Non-interactive ssh does not source ~/.bashrc; put bun/pm2 on PATH.
export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$HOME/.local/bin:/usr/local/bin:$PATH"
line() { printf '\n=== %s ===\n' "$1"; }

line "OS"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME (${VERSION_CODENAME:-?})"; uname -m

line "MEMORY / SWAP"
free -h
echo "swappiness: $(cat /proc/sys/vm/swappiness 2>/dev/null || echo '?')"

line "DISK"
df -h / 2>/dev/null

line "MAIL-IN-A-BOX"
if [ -d /root/mailinabox ] || [ -f /root/mailinabox/setup/bootstrap.sh ]; then
  echo "mailinabox present at /root/mailinabox"
  (cd /root/mailinabox && git describe --tags 2>/dev/null || git rev-parse --short HEAD 2>/dev/null) || true
else
  echo "no /root/mailinabox dir found"
fi
echo "STORAGE_ROOT/www custom config:"
ls -la /home/user-data/www/custom.yaml /home/user-data/www/mingster.com.conf 2>/dev/null || echo "  (none yet)"

line "NGINX (owned by MiaB)"
nginx -v 2>&1 || echo "nginx not installed"
echo "server_name blocks in generated config:"
grep -h "server_name" /etc/nginx/conf.d/local.conf 2>/dev/null | sort -u || echo "  (local.conf not found)"

line "LISTENING PORTS (80/443/3002/5432)"
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | grep -E ':(80|443|3001|3002|5432)\b' || echo "  none of the watched ports are listening"

line "RUNTIMES"
echo "node: $(node -v 2>/dev/null || echo missing)"
echo "bun:  $(bun --version 2>/dev/null || echo missing)"
echo "pm2:  $(pm2 -v 2>/dev/null || echo missing)"

line "POSTGRES"
psql --version 2>/dev/null || echo "psql client not installed"
systemctl is-active postgresql 2>/dev/null || echo "postgresql service: unknown"

line "APP"
if [ -d "$DEPLOY_PATH" ]; then
  echo "deploy path exists: $DEPLOY_PATH"
  [ -f "$DEPLOY_PATH/.next/BUILD_ID" ] && echo "current BUILD_ID: $(cat "$DEPLOY_PATH/.next/BUILD_ID")"
else
  echo "deploy path missing: $DEPLOY_PATH (first deploy will create it)"
fi
pm2 describe "$PM2_NAME" >/dev/null 2>&1 && pm2 status "$PM2_NAME" || echo "pm2 process '$PM2_NAME' not running"
REMOTE
