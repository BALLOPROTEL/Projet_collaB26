# Recette microservices — Collector.shop

## Démarrage recommandé

La stack complète peut maintenant être lancée avec une seule commande :

```bash
git checkout main
git pull --ff-only
npm install
docker compose down
docker compose up -d --build
docker compose ps
```

Attendre le Gateway :

```bash
until curl -fsS http://localhost:3000/api/health | grep -q '"status":"ok"'; do
  echo "J'attends les microservices..."
  sleep 2
done
echo "Stack microservices OK"
```

## Services et accès

| Composant | Accès local |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Catalog Service | http://localhost:3001 |
| Listing Service | http://localhost:3002 |
| Notification Service | http://localhost:3003 |
| Keycloak | http://localhost:8082 |
| RabbitMQ UI | http://localhost:15674 |
| Catalog PostgreSQL | localhost:5434 |
| Listing PostgreSQL | localhost:5435 |

RabbitMQ :
- utilisateur : `collector`
- mot de passe : `collector_rabbit`

Comptes applicatifs :
- USER : `user1` / `User123!`
- ADMIN : `admin1` / `Admin123!`
- Keycloak admin : `admin` / `Admin123!`

## Vérifications de séparation

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3000/api/health
```

Chaque service doit répondre avec son propre nom.

Vérifier les deux bases :

```bash
docker exec collector-catalog-db   psql -U collector_catalog -d collector_catalog   -c "SELECT current_database(), current_user;"

docker exec collector-listing-db   psql -U collector_listing -d collector_listing   -c "SELECT current_database(), current_user;"
```

## Scénario principal de démonstration

1. ouvrir http://localhost:5173 ;
2. constater que le catalogue public vient de Catalog Service ;
3. se connecter avec `user1` ;
4. créer une annonce ;
5. Listing Service écrit dans sa propre base ;
6. Listing Service publie `listing.created` dans RabbitMQ ;
7. Catalog Service reçoit l'événement et ajoute l'annonce à sa projection ;
8. Notification Service reçoit le même événement ;
9. la nouvelle annonce apparaît dans le catalogue.

Vérifier les notifications de démonstration :

```bash
curl http://localhost:3003/notifications/recent
```

Observer RabbitMQ dans http://localhost:15674.

## Autorisations

Avec USER :
- `/api/me` doit répondre 200 ;
- `/api/admin/stats` doit répondre 403.

Avec ADMIN :
- `/api/admin/stats` doit répondre 200.

## Tests automatisés

```bash
npm test
npm run build
npm audit --audit-level=high
```

La Pull Request de migration exécute aussi un smoke test distribué complet dans GitHub Actions.

## Nettoyage

```bash
docker compose down
```

Pour supprimer également les données :

```bash
docker compose down -v
```
