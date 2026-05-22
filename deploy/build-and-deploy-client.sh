#!/usr/bin/env bash
# Build Vite client and sync to nginx document root.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$REPO_ROOT/client"
DIST_DIR="$CLIENT_DIR/dist"

# Discover nginx root for signaturestudio.biz (override with NGINX_ROOT=... if needed).
NGINX_ROOT="${NGINX_ROOT:-}"
if [[ -z "$NGINX_ROOT" ]]; then
  NGINX_ROOT="$(nginx -T 2>/dev/null | awk '/server_name.*signaturestudio/{f=1} f&&/root /{print $2; exit}' | tr -d ';' || true)"
fi
if [[ -z "$NGINX_ROOT" ]]; then
  NGINX_ROOT="/var/www/EmailSignature/client/dist"
  echo "Could not detect nginx root; defaulting to $NGINX_ROOT"
fi

echo "Building client..."
npm ci --prefix "$CLIENT_DIR"
npm run build --prefix "$CLIENT_DIR"

if [[ "$NGINX_ROOT" == "$DIST_DIR" ]]; then
  echo "nginx root is already $DIST_DIR — no copy needed."
else
  echo "Syncing dist -> $NGINX_ROOT"
  mkdir -p "$NGINX_ROOT"
  rsync -av --delete "$DIST_DIR/" "$NGINX_ROOT/"
fi

echo "Done. Hard-refresh the browser (Ctrl+Shift+R)."
