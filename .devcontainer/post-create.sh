#!/usr/bin/env bash
set -euo pipefail

echo "[Collector] Preparing Codespaces workspace..."
echo "[Collector] Node $(node -v)"
echo "[Collector] npm $(npm -v)"

npm install --no-package-lock --no-audit --no-fund
node .devcontainer/prepare-codespaces.mjs

echo
echo "[Collector] Workspace ready."
echo "[Collector] Heavy services are intentionally stopped to preserve the free quota."
echo "[Collector] Start the full stack with: npm run codespaces:up"
