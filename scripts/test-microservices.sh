#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:3000}"
CATALOG_URL="${CATALOG_URL:-http://localhost:3001}"
LISTING_URL="${LISTING_URL:-http://localhost:3002}"
NOTIFICATION_URL="${NOTIFICATION_URL:-http://localhost:3003}"
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8082}"
RABBITMQ_MANAGEMENT_URL="${RABBITMQ_MANAGEMENT_URL:-http://localhost:15674}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

json_assert() {
  local expression="$1"
  node -e '
    const expression = process.argv[1];
    let data = "";
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => {
      let value;
      try { value = JSON.parse(data); } catch (error) {
        console.error("Invalid JSON:", data);
        process.exit(1);
      }
      const ok = Function("value", "return (" + expression + ")")(value);
      if (!ok) process.exit(1);
    });
  ' "$expression"
}

json_value() {
  local expression="$1"
  node -e '
    const expression = process.argv[1];
    let data = "";
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => {
      const value = JSON.parse(data);
      const result = Function("value", "return (" + expression + ")")(value);
      if (result === undefined || result === null || result === "") process.exit(1);
      process.stdout.write(String(result));
    });
  ' "$expression"
}

wait_for() {
  local name="$1"
  local url="$2"
  local attempts="${3:-90}"

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "PASS: $name disponible"
      return 0
    fi
    sleep 2
  done

  fail "$name indisponible après ${attempts} tentatives: $url"
}

echo "=== 1/10 - Disponibilité de la stack ==="
wait_for "API Gateway" "$API_URL/api/health"
wait_for "Catalog Service" "$CATALOG_URL/health"
wait_for "Listing Service" "$LISTING_URL/health"
wait_for "Notification Service" "$NOTIFICATION_URL/health"
wait_for "Keycloak" "$KEYCLOAK_URL/realms/collector/.well-known/openid-configuration"
wait_for "Frontend" "$FRONTEND_URL"

curl -fsS "$API_URL/api/health"   | json_assert 'value.status === "ok" && value.service === "api-gateway" && value.services.every(s => s.ok === true)'

curl -fsS "$CATALOG_URL/health"   | json_assert 'value.status === "ok" && value.service === "catalog-service" && value.database === "up" && value.rabbitmq === "up"'

curl -fsS "$LISTING_URL/health"   | json_assert 'value.status === "ok" && value.service === "listing-service" && value.database === "up" && value.rabbitmq === "up"'

curl -fsS "$NOTIFICATION_URL/health"   | json_assert 'value.status === "ok" && value.service === "notification-service" && value.rabbitmq === "up"'

echo "PASS: healthchecks distribués"

echo "=== 2/10 - Catalogue public ==="
curl -fsS "$API_URL/api/catalog"   | json_assert 'Array.isArray(value) && value.length >= 3'
echo "PASS: catalogue public accessible via API Gateway"

echo "=== 3/10 - Authentification USER ==="
USER_TOKEN="$(
  curl -fsS -X POST     "$KEYCLOAK_URL/realms/collector/protocol/openid-connect/token"     -H "Content-Type: application/x-www-form-urlencoded"     -d "client_id=collector-web"     -d "grant_type=password"     -d "username=user1"     -d "password=User123!"     | json_value 'value.access_token'
)"
test -n "$USER_TOKEN" || fail "token USER vide"

curl -fsS   -H "Authorization: Bearer $USER_TOKEN"   "$API_URL/api/me"   | json_assert 'Array.isArray(value.roles) && value.roles.includes("USER")'
echo "PASS: USER authentifié"

echo "=== 4/10 - Contrôle d'accès USER -> ADMIN ==="
USER_ADMIN_STATUS="$(
  curl -sS -o /tmp/collector-user-admin.json -w "%{http_code}"     -H "Authorization: Bearer $USER_TOKEN"     "$API_URL/api/admin/stats"
)"
test "$USER_ADMIN_STATUS" = "403"   || fail "USER devait recevoir 403 sur /api/admin/stats, reçu $USER_ADMIN_STATUS"
echo "PASS: USER refusé sur l'administration (403)"

echo "=== 5/10 - Création d'une annonce dans Listing Service ==="
TITLE="Recette équipe $(date +%Y%m%d-%H%M%S)"
DESCRIPTION="Annonce créée par la recette microservices collaborative"
PRICE="42.50"

CREATED="$(
  curl -fsS -X POST "$API_URL/api/listings"     -H "Authorization: Bearer $USER_TOKEN"     -H "Content-Type: application/json"     -d "{\"title\":\"${TITLE}\",\"description\":\"${DESCRIPTION}\",\"price\":${PRICE}}"
)"

printf '%s' "$CREATED"   | json_assert 'value.event === "listing.created" && Number.isInteger(value.id) && value.title.startsWith("Recette équipe")'
echo "PASS: annonce créée et événement listing.created publié"

echo "=== 6/10 - Vérification côté Listing Service ==="
curl -fsS "$API_URL/api/listings"   | TITLE="$TITLE" node -e '
      const title = process.env.TITLE;
      let data = "";
      process.stdin.on("data", chunk => data += chunk);
      process.stdin.on("end", () => {
        const items = JSON.parse(data);
        if (!Array.isArray(items) || !items.some(item => item.title === title)) process.exit(1);
      });
    '
echo "PASS: annonce présente dans la source de vérité Listing"

echo "=== 7/10 - Vérification RabbitMQ ==="
docker exec collector-rabbitmq rabbitmq-diagnostics -q ping >/dev/null \
  || fail "RabbitMQ ne répond pas au ping"

QUEUES="$(docker exec collector-rabbitmq rabbitmqctl list_queues name)"
printf '%s\n' "$QUEUES" | grep -q "catalog.listing-created" \
  || fail "queue catalog.listing-created absente"
printf '%s\n' "$QUEUES" | grep -q "notification.listing-created" \
  || fail "queue notification.listing-created absente"
echo "PASS: RabbitMQ actif et queues Catalog / Notification présentes"

echo "=== 8/10 - Projection asynchrone dans Catalog Service ==="
CATALOG_OK=0
for i in {1..30}; do
  if curl -fsS "$API_URL/api/catalog"     | TITLE="$TITLE" node -e '
        const title = process.env.TITLE;
        let data = "";
        process.stdin.on("data", chunk => data += chunk);
        process.stdin.on("end", () => {
          const items = JSON.parse(data);
          process.exit(Array.isArray(items) && items.some(item => item.title === title) ? 0 : 1);
        });
      '; then
    CATALOG_OK=1
    break
  fi
  sleep 1
done
test "$CATALOG_OK" = "1" || fail "annonce non projetée dans Catalog Service"
echo "PASS: RabbitMQ -> Catalog Service validé"

echo "=== 9/10 - Consommation par Notification Service ==="
NOTIFICATION_OK=0
for i in {1..30}; do
  if curl -fsS "$NOTIFICATION_URL/notifications/recent"     | TITLE="$TITLE" node -e '
        const title = process.env.TITLE;
        let data = "";
        process.stdin.on("data", chunk => data += chunk);
        process.stdin.on("end", () => {
          const items = JSON.parse(data);
          process.exit(Array.isArray(items) && items.some(item => item.title === title) ? 0 : 1);
        });
      '; then
    NOTIFICATION_OK=1
    break
  fi
  sleep 1
done
test "$NOTIFICATION_OK" = "1" || fail "Notification Service n'a pas consommé l'événement"
echo "PASS: RabbitMQ -> Notification Service validé"

echo "=== 10/10 - Authentification ADMIN et frontend ==="
ADMIN_TOKEN="$(
  curl -fsS -X POST     "$KEYCLOAK_URL/realms/collector/protocol/openid-connect/token"     -H "Content-Type: application/x-www-form-urlencoded"     -d "client_id=collector-web"     -d "grant_type=password"     -d "username=admin1"     -d "password=Admin123!"     | json_value 'value.access_token'
)"

curl -fsS   -H "Authorization: Bearer $ADMIN_TOKEN"   "$API_URL/api/admin/stats"   | json_assert 'value.message === "Admin access granted"'

curl -fsS "$FRONTEND_URL" | grep -q "Collector.shop"   || fail "frontend non accessible"

echo
echo "============================================================"
echo "RECETTE MICROSERVICES: PASS"
echo "Annonce testée: $TITLE"
echo "Flux validé:"
echo "Frontend/API Gateway -> Listing Service -> Listing DB"
echo "                     -> RabbitMQ"
echo "                     -> Catalog Service"
echo "                     -> Notification Service"
echo "Keycloak USER/ADMIN  -> PASS"
echo "============================================================"
