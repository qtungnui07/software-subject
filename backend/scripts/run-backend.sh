#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
ROOT_DIR=$(CDPATH= cd -- "$BACKEND_DIR/.." && pwd)

if [ ! -d "$BACKEND_DIR/node_modules/postgres" ] || [ ! -d "$BACKEND_DIR/node_modules/nodemailer" ]; then
  npm --prefix "$BACKEND_DIR" install --no-audit --no-fund
fi

NODE_PATH="$BACKEND_DIR/node_modules:$ROOT_DIR/frontend/node_modules${NODE_PATH:+:$NODE_PATH}" \
  sh -c '
    attempts=0
    until npm --prefix "$1" run migrate; do
      attempts=$((attempts + 1))
      if [ "$attempts" -ge 15 ]; then
        echo "Database did not become ready after 15 attempts" >&2
        exit 1
      fi
      echo "Database is not ready yet; retrying migration in 2 seconds..."
      sleep 2
    done
    npm --prefix "$1" run seed:content
    npm --prefix "$1" start
  ' sh "$BACKEND_DIR"
