#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Sync riben.life (upstream) into mingster.com, preserving mingster's own
# auth, blog and virtual-experience code.
#
#   bin/sync/sync-from-riben.sh                 # dry run — shows what would change
#   bin/sync/sync-from-riben.sh --apply         # branch + copy + verify + commit
#   bin/sync/sync-from-riben.sh --apply --pr    # ... and open a PR via gh
#   bin/sync/sync-from-riben.sh --apply --prune # also delete files riben removed
#
# Options:
#   --apply           actually write (default is dry run)
#   --pr              open a pull request with gh after committing
#   --prune           delete non-protected files that no longer exist upstream
#   --no-verify       skip lint/typecheck
#   --only <path>     restrict the sync to one subtree (repeatable)
#   --riben <path>    override upstream repo location
# ---------------------------------------------------------------------------
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=./riben-sync.config.sh
source "$SCRIPT_DIR/riben-sync.config.sh"

APPLY=0 OPEN_PR=0 PRUNE=0 VERIFY=1
ONLY=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)      APPLY=1 ;;
    --pr)         OPEN_PR=1 ;;
    --prune)      PRUNE=1 ;;
    --no-verify)  VERIFY=0 ;;
    --only)       ONLY+=("$2"); shift ;;
    --riben)      RIBEN_REPO="$2"; shift ;;
    -h|--help)    sed -n '2,20p' "${BASH_SOURCE[0]}"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

STAMP="$(date +%Y%m%d-%H%M)"
WORK="$(mktemp -d)"
REPORT="$WORK/sync-report.md"
STATE_FILE="$REPO_ROOT/.riben-sync-state"
trap 'rm -rf "$WORK"' EXIT

c_dim=$'\033[2m'; c_red=$'\033[31m'; c_grn=$'\033[32m'; c_yel=$'\033[33m'; c_off=$'\033[0m'
say()  { printf '%s\n' "$*"; }
step() { printf '\n%s==>%s %s\n' "$c_grn" "$c_off" "$*"; }
warn() { printf '%s[warn]%s %s\n' "$c_yel" "$c_off" "$*"; }
die()  { printf '%s[fail]%s %s\n' "$c_red" "$c_off" "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 1. Preflight
# ---------------------------------------------------------------------------
step "Preflight"

[[ -d "$RIBEN_REPO/.git" ]] || die "upstream repo not found at $RIBEN_REPO (set RIBEN_REPO or pass --riben)"
command -v rsync >/dev/null || die "rsync not found"
command -v node  >/dev/null || die "node not found"

git -C "$REPO_ROOT" rev-parse --git-dir >/dev/null 2>&1 || die "$REPO_ROOT is not a git repo"

if [[ -n "$(git -C "$REPO_ROOT" status --porcelain)" ]]; then
  if [[ $APPLY -eq 1 ]]; then
    die "mingster.com has uncommitted changes — commit or stash first"
  fi
  warn "mingster.com working tree is dirty (fine for a dry run)"
fi

if [[ -n "$(git -C "$RIBEN_REPO" status --porcelain)" ]]; then
  warn "riben.life working tree is dirty — syncing from its working tree as-is"
fi

say "  upstream : $RIBEN_REPO ($(git -C "$RIBEN_REPO" rev-parse --abbrev-ref HEAD) @ $(git -C "$RIBEN_REPO" rev-parse --short HEAD))"
say "  local    : $REPO_ROOT ($(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD) @ $(git -C "$REPO_ROOT" rev-parse --short HEAD))"

if [[ $APPLY -eq 1 ]]; then
  step "Fetching upstream $RIBEN_BRANCH"
  git -C "$RIBEN_REPO" fetch --quiet origin "$RIBEN_BRANCH"
  git -C "$RIBEN_REPO" checkout --quiet "$RIBEN_BRANCH"
  git -C "$RIBEN_REPO" merge --ff-only --quiet "origin/$RIBEN_BRANCH" \
    || warn "could not fast-forward riben.life to origin/$RIBEN_BRANCH — using local state"
fi

UPSTREAM_SHA="$(git -C "$RIBEN_REPO" rev-parse HEAD)"
LAST_SHA=""
[[ -f "$STATE_FILE" ]] && LAST_SHA="$(grep -E '^riben_sha=' "$STATE_FILE" | cut -d= -f2 || true)"

# ---------------------------------------------------------------------------
# 2. Build the rsync filter
# ---------------------------------------------------------------------------
step "Building filter"

FILTER="$WORK/filter.rules"
: > "$FILTER"
for p in "${EXCLUDE[@]}"; do printf -- '- %s\n' "$p" >> "$FILTER"; done
for p in "${PROTECT[@]}"; do printf -- '- %s\n' "$p" >> "$FILTER"; done
# i18n handled by merge-i18n.mjs, not by a plain copy
printf -- '- /%s\n' "$I18N_MERGE_GLOB" >> "$FILTER"

say "  ${#EXCLUDE[@]} excluded, ${#PROTECT[@]} protected paths"

# -c: compare by checksum, not size+mtime. Slower, but the itemized list then
# contains only files whose CONTENT actually differs — which is what the report
# and the resulting git diff should reflect.
RSYNC_ARGS=(-rlptc --itemize-changes --filter="merge $FILTER")
[[ $PRUNE -eq 1 ]] && RSYNC_ARGS+=(--delete)   # excluded paths are protected from --delete
[[ $APPLY -eq 0 ]] && RSYNC_ARGS+=(--dry-run)

if [[ ${#ONLY[@]} -gt 0 ]]; then
  for sub in "${ONLY[@]}"; do RSYNC_ARGS+=(--include="/${sub%/}/***"); done
  RSYNC_ARGS+=(--include='*/' --exclude='*')
  say "  restricted to: ${ONLY[*]}"
fi

# ---------------------------------------------------------------------------
# 3. Branch
# ---------------------------------------------------------------------------
BRANCH="sync/riben-$STAMP"
if [[ $APPLY -eq 1 ]]; then
  step "Creating branch $BRANCH"
  git -C "$REPO_ROOT" checkout -q -b "$BRANCH"
fi

# ---------------------------------------------------------------------------
# 4. Copy
# ---------------------------------------------------------------------------
step "Syncing files$([[ $APPLY -eq 0 ]] && echo ' (DRY RUN)')"

rsync "${RSYNC_ARGS[@]}" "$RIBEN_REPO/" "$REPO_ROOT/" > "$WORK/rsync.out" || die "rsync failed"

# itemize codes: >f.. new/changed file, *deleting, cd+ new dir
CHANGED=$(grep -cE '^[<>]f' "$WORK/rsync.out" || true)
DELETED=$(grep -cE '^\*deleting' "$WORK/rsync.out" || true)
say "  $CHANGED file(s) added/updated, $DELETED deleted"

# ---------------------------------------------------------------------------
# 5. Merge i18n
# ---------------------------------------------------------------------------
step "Merging i18n locales"

I18N_LOG="$WORK/i18n.log"
: > "$I18N_LOG"
while IFS= read -r rel; do
  up="$RIBEN_REPO/$rel"
  loc="$REPO_ROOT/$rel"
  if [[ $APPLY -eq 1 ]]; then
    mkdir -p "$(dirname "$loc")"
    node "$SCRIPT_DIR/merge-i18n.mjs" "$up" "$loc" "$loc" >> "$I18N_LOG"
  else
    tmp="$WORK/$(echo "$rel" | tr '/' '_')"
    node "$SCRIPT_DIR/merge-i18n.mjs" "$up" "$loc" "$tmp" >> "$I18N_LOG"
  fi
done < <(cd "$RIBEN_REPO" && compgen -G "$I18N_MERGE_GLOB" || true)
sed 's/^/  /' "$I18N_LOG"

# ---------------------------------------------------------------------------
# 6. Report
# ---------------------------------------------------------------------------
step "Building report"

{
  echo "# riben.life -> mingster.com sync"
  echo
  echo "- date: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo "- upstream: \`${UPSTREAM_SHA:0:12}\` on $RIBEN_BRANCH"
  echo "- previous sync: ${LAST_SHA:0:12}${LAST_SHA:+ }"
  echo "- mode: $([[ $APPLY -eq 1 ]] && echo apply || echo dry-run)$([[ $PRUNE -eq 1 ]] && echo ' +prune')"
  echo "- files added/updated: $CHANGED, deleted: $DELETED"
  echo

  echo "## Protected files changed upstream — port by hand if wanted"
  echo
  if [[ -n "$LAST_SHA" ]]; then
    hits=0
    while IFS= read -r f; do
      for p in "${PROTECT[@]}"; do
        case "/$f" in
          ${p%/\*\*\*}*) echo "- \`$f\`"; hits=$((hits+1)); break ;;
        esac
      done
    done < <(git -C "$RIBEN_REPO" diff --name-only "$LAST_SHA..HEAD" 2>/dev/null || true)
    [[ $hits -eq 0 ]] && echo "_None._"
  else
    echo "_No previous sync recorded — skipping. This section works from the next sync on._"
  fi
  echo

  echo "## Needs a follow-up action"
  echo
  for r in "${REVIEW[@]}"; do
    if grep -qF -- "$r" "$WORK/rsync.out"; then
      echo "- \`$r\` changed"
    fi
  done
  echo
  echo "If \`web/prisma/schema.prisma\` changed: \`cd web && bun run sql:generate && bun run dbpush\`"
  echo

  echo "## Changed files"
  echo
  echo '```'
  grep -E '^[<>]f|^\*deleting' "$WORK/rsync.out" | head -400 || echo "(none)"
  [[ $((CHANGED + DELETED)) -gt 400 ]] && echo "... $((CHANGED + DELETED - 400)) more"
  echo '```'
  echo

  echo "## i18n"
  echo
  echo '```'
  cat "$I18N_LOG"
  echo '```'
  echo

  node "$SCRIPT_DIR/dep-drift.mjs" \
    "$REPO_ROOT/web/package.json" "$RIBEN_REPO/web/package.json" 2>/dev/null \
    || echo "_dep-drift failed_"
} > "$REPORT"

cp "$REPORT" "$REPO_ROOT/sync-report.md"
say "  ${c_dim}wrote sync-report.md${c_off}"

# ---------------------------------------------------------------------------
# 7. Dry run stops here
# ---------------------------------------------------------------------------
if [[ $APPLY -eq 0 ]]; then
  step "Dry run complete"
  say "  Review ./sync-report.md, then re-run with --apply"
  exit 0
fi

# ---------------------------------------------------------------------------
# 8. Verify
# ---------------------------------------------------------------------------
VERIFY_STATUS="skipped"
if [[ $VERIFY -eq 1 ]]; then
  step "Verifying"
  pushd "$REPO_ROOT/web" >/dev/null
  bun install || warn "bun install reported problems"
  bun run sql:generate || warn "prisma generate reported problems"
  if bun x tsc --noEmit -p tsconfig.json; then
    VERIFY_STATUS="typecheck passed"
    say "  ${c_grn}typecheck passed${c_off}"
  else
    VERIFY_STATUS="typecheck FAILED"
    warn "typecheck failed — the sync is committed on $BRANCH so you can fix it there"
  fi
  bun run bio_lint || warn "biome reported problems"
  popd >/dev/null
fi

# ---------------------------------------------------------------------------
# 9. Commit
# ---------------------------------------------------------------------------
step "Committing"

printf 'riben_sha=%s\nsynced_at=%s\n' "$UPSTREAM_SHA" "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" > "$STATE_FILE"

git -C "$REPO_ROOT" add -A
if git -C "$REPO_ROOT" diff --cached --quiet; then
  warn "nothing to commit — already in sync"
  git -C "$REPO_ROOT" checkout -q -
  git -C "$REPO_ROOT" branch -q -D "$BRANCH"
  exit 0
fi

git -C "$REPO_ROOT" commit -q -F - <<EOF
chore:🤖 (sync): pull riben.life ${UPSTREAM_SHA:0:12} into mingster.com

$CHANGED file(s) added/updated, $DELETED deleted.
Protected (not overwritten): auth, blog, virtual-experience, subscribe, build config.
i18n locales deep-merged, mingster-only keys preserved.
Verification: $VERIFY_STATUS

See sync-report.md for dependency drift and follow-up actions.
EOF

say "  committed on $BRANCH"

# ---------------------------------------------------------------------------
# 10. PR
# ---------------------------------------------------------------------------
if [[ $OPEN_PR -eq 1 ]]; then
  step "Opening pull request"
  if command -v gh >/dev/null; then
    git -C "$REPO_ROOT" push -q -u origin "$BRANCH"
    gh pr create --repo mingster/mingster.com \
      --base main --head "$BRANCH" \
      --title "chore(sync): riben.life ${UPSTREAM_SHA:0:12}" \
      --body-file "$REPORT"
  else
    warn "gh not installed — push and open the PR manually:"
    say  "    git push -u origin $BRANCH"
  fi
fi

step "Done"
say "  branch : $BRANCH"
say "  report : sync-report.md"
say "  verify : $VERIFY_STATUS"
say ""
say "  Next: cd web && bun run dev  — smoke-test /, /blog, /auth/signIn, /shop"
