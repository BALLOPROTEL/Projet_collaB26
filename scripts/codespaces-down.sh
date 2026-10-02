#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .codespaces/codespace.env ]]; then
  echo "[Collector] No generated Codespaces environment found."
  exit 0
fi

docker compose   --env-file .codespaces/codespace.env   -f compose.yaml   -f .devcontainer/compose.codespaces.yml   down --remove-orphans
