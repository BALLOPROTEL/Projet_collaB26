#!/usr/bin/env bash
set -euo pipefail

compose=(
  docker compose
  --env-file .codespaces/codespace.env
  -f compose.yaml
  -f .devcontainer/compose.codespaces.yml
)

echo "=== Collector.shop containers ==="
"${compose[@]}" ps

echo
echo "=== Collector.shop distributed recipe ==="
bash scripts/test-microservices.sh

echo
echo "Collector.shop Codespaces validation: PASS"
