#!/usr/bin/env bash
set -euo pipefail

if [[ "${CODESPACES:-}" != "true" ]]; then
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "[Collector] node_modules missing; restoring workspace dependencies..."
  npm install --no-package-lock --no-audit --no-fund
fi

node .devcontainer/prepare-codespaces.mjs

echo "[Collector] Codespaces URLs refreshed."
echo "[Collector] Start with: npm run codespaces:up"
