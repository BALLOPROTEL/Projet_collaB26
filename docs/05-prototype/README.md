# Prototype Collector.shop V1 — lancement local

Ce prototype sert de support aux démonstrations du projet collaboratif. Il ne cherche pas à reproduire toute la marketplace finale.

## Périmètre implémenté

- frontend web ;
- backend/API ;
- PostgreSQL de démonstration ;
- catalogue public ;
- authentification Keycloak ;
- rôles USER et ADMIN ;
- route utilisateur protégée ;
- route administration protégée ;
- création d'annonce authentifiée ;
- endpoint de santé ;
- tests unitaires de base ;
- Dockerfiles préparatoires.

## Prérequis

- Git
- Docker + Docker Compose
- Node.js 20 ou supérieur
- npm

## 1. Récupérer le projet

```bash
git clone https://github.com/BALLOPROTEL/Projet_collaB26.git
cd Projet_collaB26
git checkout main
git pull
```

## 2. Installer les dépendances

```bash
npm install
```

## 3. Démarrer PostgreSQL et Keycloak

```bash
docker compose up -d postgres keycloak
docker compose ps
```

Au premier démarrage, patienter jusqu'à ce que Keycloak soit disponible.

Vérification :

```bash
curl -fsS http://localhost:8082/realms/collector/.well-known/openid-configuration > /dev/null && echo "Keycloak OK"
```

## 4. Démarrer le backend

Dans un premier terminal :

```bash
npm run dev:api
```

Accès backend :

- santé : http://localhost:3000/api/health
- catalogue : http://localhost:3000/api/catalog

Tests rapides :

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/catalog
```

## 5. Démarrer le frontend

Dans un deuxième terminal :

```bash
npm run dev:web
```

Accès frontend :

- http://localhost:5173

## Comptes de démonstration

Ces comptes sont uniquement destinés au projet local.

### Utilisateur standard

- identifiant : `user1`
- mot de passe : `User123!`
- rôle : `USER`

Ce compte peut :
- consulter le catalogue ;
- se connecter ;
- accéder à l'espace utilisateur ;
- créer une annonce ;
- il ne peut pas accéder à la route d'administration.

### Administrateur

- identifiant : `admin1`
- mot de passe : `Admin123!`
- rôles : `USER`, `ADMIN`

Ce compte peut aussi tester l'espace administration.

## Console Keycloak

- URL : http://localhost:8082/admin/
- administrateur local : `admin`
- mot de passe local : `Admin123!`

Ces identifiants ne doivent jamais être réutilisés en production.

## Tester le backend avec un jeton

Le frontend est la méthode recommandée pour la démonstration. Pour les tests API manuels, récupérer un jeton depuis le navigateur ou utiliser l'interface de connexion Keycloak, puis :

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/me

curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/admin/stats
```

Résultat attendu :
- USER : `/api/me` = 200 ; `/api/admin/stats` = 403.
- ADMIN : les deux routes = 200.

## Créer une annonce via API

```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Objet test","description":"Annonce de démonstration","price":42.50}'
```

## Lancer les tests

```bash
npm test
```

## Construire le frontend

```bash
npm run build
```

## Arrêter l'environnement

```bash
docker compose down
```

Pour supprimer également les données PostgreSQL :

```bash
docker compose down -v
```

## Ports utilisés

| Service | URL / port |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Keycloak | http://localhost:8082 |
| PostgreSQL | localhost:5434 |

## Note sécurité

Les mots de passe présents dans ce prototype sont des secrets **de démonstration uniquement**. La tâche Sécurité devra durcir la configuration avant la soutenance et expliquer les différences avec un environnement réel.
