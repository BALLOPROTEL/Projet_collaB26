#!/usr/bin/env bash
set -euo pipefail

if [[ "${CODESPACES:-}" != "true" ]]; then
  echo "[FAIL] This command is reserved for GitHub Codespaces."
  exit 1
fi

node .devcontainer/prepare-codespaces.mjs

compose=(
  docker compose
  --env-file .codespaces/codespace.env
  -f compose.yaml
  -f .devcontainer/compose.codespaces.yml
)

echo "=== Collector.shop Codespaces stack ==="
"${compose[@]}" up -d --build

echo "[INFO] Waiting for Keycloak realm..."
for attempt in $(seq 1 120); do
  if curl -fsS http://127.0.0.1:8082/realms/collector/.well-known/openid-configuration >/dev/null 2>&1; then
    echo "[OK] Keycloak realm ready."
    break
  fi

  if [[ "${attempt}" -eq 120 ]]; then
    echo "[FAIL] Keycloak did not become ready."
    "${compose[@]}" logs --tail=150 keycloak
    exit 1
  fi
  sleep 2
done

echo "[INFO] Waiting for API Gateway..."
for attempt in $(seq 1 120); do
  if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "[OK] API Gateway ready."
    break
  fi

  if [[ "${attempt}" -eq 120 ]]; then
    echo "[FAIL] API Gateway did not become ready."
    "${compose[@]}" ps
    "${compose[@]}" logs --tail=150
    exit 1
  fi
  sleep 2
done

echo
echo "[OK] Collector.shop cloud stack is ready."
echo "Next:"
echo "  npm run codespaces:check"
