#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
ROOT_DIR=$(CDPATH= cd -- "$BACKEND_DIR/.." && pwd)

if [ ! -d "$BACKEND_DIR/node_modules/postgres" ] || [ ! -d "$BACKEND_DIR/node_modules/nodemailer" ]; then
  npm --prefix "$BACKEND_DIR" install --no-audit --no-fund
fi

NODE_PATH="$BACKEND_DIR/node_modules:$ROOT_DIR/frontend/node_modules${NODE_PATH:+:$NODE_PATH}" \
  npm --prefix "$BACKEND_DIR" start
