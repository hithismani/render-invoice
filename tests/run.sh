#!/usr/bin/env bash
# Run a monorepo test file with web's tsx + @/ path aliases + node_modules.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/web"
export NODE_PATH="$PWD/node_modules"
exec ./node_modules/.bin/tsx --tsconfig tsconfig.json "$ROOT/tests/$1" "${@:2}"
