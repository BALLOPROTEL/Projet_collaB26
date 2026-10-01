# TESTS ÉQUIPE — Collector.shop

Ce document est désormais **l'unique guide de démarrage, de recette et de validation** du prototype Collector.shop pour toute l'équipe.

Objectif : permettre à chaque membre de cloner le projet sur son PC, lancer la même architecture microservices, exécuter la même recette et partager un résultat PASS / FAIL comparable.

---

## 1. Architecture réellement testée

```text
Frontend
   |
API Gateway
   |----------------------|
Catalog Service       Listing Service
   |                      |
Catalog DB            Listing DB
                          |
                       RabbitMQ
                      /        \
          Catalog Service     Notification Service

Keycloak -> authentification / rôles USER et ADMIN
```

Le scénario collectif à valider est :

```text
Création d'annonce
      |
      v
API Gateway
      |
      v
Listing Service
      |
      +----> Listing DB
      |
      +----> événement listing.created
                   |
                   v
                RabbitMQ
               /        \
              v          v
      Catalog Service   Notification Service
              |
              v
         Catalog DB
```

Le frontend consulte ensuite le catalogue via l'API Gateway et la nouvelle annonce devient visible après propagation de l'événement.

---

## 2. Prérequis sur chaque PC

Installer :

- Git ;
- Docker Engine + Docker Compose, ou Docker Desktop ;
- Node.js 20 ou supérieur ;
- npm ;
- curl ;
- Bash.

Sous Windows, utiliser de préférence **WSL** ou **Git Bash** pour les commandes de ce guide.

Vérifications :

```bash
git --version
docker --version
docker compose version
node --version
npm --version
curl --version
```

Node.js doit être en version 20 ou supérieure.

---

## 3. Cloner ou mettre à jour le projet

### Première installation

```bash
git clone https://github.com/BALLOPROTEL/Projet_collaB26.git
cd Projet_collaB26
npm install
```

### Projet déjà présent

```bash
cd Projet_collaB26
git checkout main
git pull --ff-only
npm install
```

Vérifier la version testée :

```bash
git rev-parse --short HEAD
```

Tous les membres doivent idéalement tester le **même commit de `main`**.

---

## 4. Premier démarrage propre

Pour un premier démarrage, après une grosse évolution d'architecture ou en cas d'environnement local incohérent :

```bash
docker compose down --remove-orphans -v
docker compose up -d --build
docker compose ps
```

Attention : `-v` supprime les données locales de démonstration de Collector.shop. Ne pas l'utiliser pour un simple redémarrage si l'on souhaite conserver ses données locales.

Pour un démarrage normal :

```bash
docker compose up -d --build
```

---

## 5. Conteneurs attendus

`docker compose ps` doit montrer les composants suivants :

| Conteneur | Rôle |
|---|---|
| `collector-web` | Frontend |
| `collector-api-gateway` | Point d'entrée API |
| `collector-catalog-service` | Catalogue public |
| `collector-listing-service` | Gestion des annonces |
| `collector-notification-service` | Consommation des notifications |
| `collector-rabbitmq` | Broker de messages |
| `collector-keycloak` | Identité / authentification / rôles |
| `collector-catalog-db` | Base dédiée Catalog |
| `collector-listing-db` | Base dédiée Listing |

Les services disposant d'un healthcheck doivent devenir `healthy`.

---

## 6. Accès locaux

| Composant | Adresse |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| Catalog Service | http://localhost:3001 |
| Listing Service | http://localhost:3002 |
| Notification Service | http://localhost:3003 |
| Keycloak | http://localhost:8082 |
| Console Keycloak | http://localhost:8082/admin/ |
| RabbitMQ Management | http://localhost:15674 |
| Catalog PostgreSQL | localhost:5434 |
| Listing PostgreSQL | localhost:5435 |

### Comptes applicatifs

USER :

```text
user1
User123!
```

ADMIN :

```text
admin1
Admin123!
```

Console Keycloak :

```text
admin
Admin123!
```

RabbitMQ :

```text
collector
collector_rabbit
```

Ces identifiants sont exclusivement destinés à l'environnement pédagogique local.

---

## 7. Vérifier que la stack est prête

Attendre le Gateway :

```bash
until curl -fsS http://localhost:3000/api/health | grep -q '"status":"ok"'; do
  echo "J'attends les microservices..."
  sleep 2
done

echo "Stack microservices OK"
```

Puis vérifier les quatre services :

```bash
curl -fsS http://localhost:3000/api/health
echo
curl -fsS http://localhost:3001/health
echo
curl -fsS http://localhost:3002/health
echo
curl -fsS http://localhost:3003/health
echo
```

Résultats attendus :

- Gateway : `status: ok` ;
- Catalog : DB `up`, RabbitMQ `up` ;
- Listing : DB `up`, RabbitMQ `up` ;
- Notification : RabbitMQ `up`.

---

## 8. Recette microservices automatisée — test obligatoire

Une fois la stack démarrée, chaque membre exécute :

```bash
bash scripts/test-microservices.sh
```

Cette commande réalise automatiquement la recette complète :

1. vérifie Gateway, Catalog, Listing, Notification, Keycloak et Frontend ;
2. vérifie le catalogue public ;
3. récupère un token USER dans Keycloak ;
4. vérifie que USER accède à `/api/me` ;
5. vérifie que USER reçoit `403` sur l'administration ;
6. crée une annonce via l'API Gateway ;
7. vérifie que l'annonce existe dans Listing Service ;
8. vérifie les queues RabbitMQ ;
9. attend la projection de l'annonce dans Catalog Service ;
10. vérifie la consommation de l'événement par Notification Service ;
11. récupère un token ADMIN ;
12. vérifie que ADMIN accède à l'administration ;
13. vérifie que le frontend répond.

Résultat final attendu :

```text
RECETTE MICROSERVICES: PASS
```

Le script affiche également le titre de l'annonce générée automatiquement.

---

## 9. Comprendre la recette : création → RabbitMQ → Catalog → Notification

La recette automatique valide précisément ce flux.

### Étape A — création de l'annonce

L'utilisateur `user1` s'authentifie auprès de Keycloak puis appelle :

```text
POST /api/listings
```

L'appel passe par :

```text
Frontend / client
      |
API Gateway
      |
Listing Service
```

Listing Service stocke l'annonce dans sa propre base `collector_listing`.

### Étape B — publication RabbitMQ

Après création, Listing Service publie :

```text
exchange : collector.events
routing key : listing.created
```

Les queues attendues sont :

```text
catalog.listing-created
notification.listing-created
```

Elles peuvent être observées dans :

```text
http://localhost:15674
```

### Étape C — Catalog Service

Catalog Service consomme `listing.created` et écrit une projection dans sa propre base `collector_catalog`.

Le test vérifie ensuite que le titre créé apparaît dans :

```text
GET /api/catalog
```

### Étape D — Notification Service

Notification Service consomme indépendamment le même événement.

Vérification manuelle :

```bash
curl -fsS http://localhost:3003/notifications/recent
```

Le titre de l'annonce créée pendant la recette doit apparaître.

---

## 10. Vérifier les deux bases indépendantes

Catalog :

```bash
docker exec collector-catalog-db \
  psql -U collector_catalog -d collector_catalog \
  -c "SELECT current_database(), current_user;"
```

Listing :

```bash
docker exec collector-listing-db \
  psql -U collector_listing -d collector_listing \
  -c "SELECT current_database(), current_user;"
```

Résultat attendu :

```text
collector_catalog | collector_catalog
collector_listing | collector_listing
```

Cela permet de montrer au jury que Catalog et Listing ne partagent pas une table métier unique.

---

## 11. Recette visuelle dans le navigateur

Ouvrir :

```text
http://localhost:5173
```

Tester comme visiteur :

- le catalogue doit être visible sans connexion ;
- les objets de démonstration doivent apparaître.

Tester comme USER :

```text
user1 / User123!
```

Puis :

- vérifier l'espace utilisateur ;
- créer une annonce ;
- attendre le message confirmant la projection via RabbitMQ ;
- actualiser le catalogue ;
- vérifier que l'annonce apparaît.

Tester comme ADMIN :

```text
admin1 / Admin123!
```

Puis :

- ouvrir le bloc administration ;
- lancer le test d'accès admin ;
- vérifier que l'accès est accepté.

---

## 12. Tests techniques supplémentaires

### Qualité, tests unitaires et build

```bash
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

Résultat attendu : toutes les commandes passent.

### Test E2E navigateur avec Playwright

Le navigateur de test doit être installé une première fois :

```bash
npx playwright install chromium
```

Avec la stack Docker déjà démarrée :

```bash
npm run test:e2e
```

Le scénario E2E vérifie :
- catalogue public ;
- authentification Keycloak USER ;
- création d'une annonce depuis l'interface ;
- propagation RabbitMQ jusqu'au catalogue ;
- authentification ADMIN ;
- accès à l'administration.

### Test de performance simple

Avec la stack démarrée :

```bash
npm run test:perf
```

Valeurs par défaut :
- 300 requêtes ;
- concurrence 20 ;
- p95 attendu <= 1000 ms ;
- débit minimum attendu >= 5 requêtes/s.

Les seuils peuvent être ajustés sans modifier le code :

```bash
PERF_REQUESTS=500 \
PERF_CONCURRENCY=25 \
PERF_P95_MS=1200 \
npm run test:perf
```

Ce test de performance reste volontairement séparé du pipeline CI principal pour éviter les résultats instables liés aux performances variables des runners.

---

## 13. Tests par rôle

### Seydou — Lead Dev

Valider :

- cohérence globale de la stack ;
- Gateway et frontières des services ;
- flux Listing → RabbitMQ → Catalog / Notification ;
- USER / ADMIN ;
- tests, build et absence de régression.

### Nouhaila — DevOps

Valider :

- Docker Compose ;
- healthchecks ;
- images des microservices ;
- RabbitMQ ;
- GitHub Actions ;
- préparation Jenkins ;
- préparation Kubernetes / Kind.

Le job GitHub Actions à observer est :

```text
Distributed microservices smoke test
```

### Yvan — Architecte

Valider :

- Frontend → API Gateway ;
- Gateway → services métier ;
- Catalog et Listing séparés ;
- bases séparées ;
- communication événementielle RabbitMQ ;
- absence d'accès direct d'un service à la base de l'autre ;
- conformité avec `docs/03-architecture/architecture-technique-microservices.md`.

### Oumou — Sécurité

Valider :

- route privée sans token → `401` ;
- USER → espace utilisateur autorisé ;
- USER → administration → `403` ;
- ADMIN → administration → `200` ;
- rôles Keycloak ;
- audit des dépendances ;
- aucune vraie donnée personnelle ou bancaire dans les jeux de test.

Commande :

```bash
npm audit --audit-level=high
```

### Roger — Product Owner

Valider :

- catalogue public ;
- connexion utilisateur ;
- création d'annonce ;
- apparition de l'annonce dans le catalogue ;
- distinction USER / ADMIN ;
- compréhension du parcours par un utilisateur non technique.

Le prototype ne couvre pas encore complètement paiement, chat, fraude, recommandations avancées ou modération complète : ces sujets restent dans le cadrage et l'architecture cible.

---

## 14. Compte rendu obligatoire de chaque membre

Chaque membre partage :

```text
Nom :
Rôle :
OS :
Commit testé :

docker compose up : PASS / FAIL
9 composants présents : PASS / FAIL
Gateway health : PASS / FAIL
Catalog health : PASS / FAIL
Listing health : PASS / FAIL
Notification health : PASS / FAIL
Frontend : PASS / FAIL
Connexion USER : PASS / FAIL
USER -> admin = 403 : PASS / FAIL
Création annonce : PASS / FAIL
Listing Service : PASS / FAIL
Queues RabbitMQ : PASS / FAIL
Projection Catalog : PASS / FAIL
Notification Service : PASS / FAIL
Connexion ADMIN : PASS / FAIL
ADMIN -> admin = 200 : PASS / FAIL
scripts/test-microservices.sh : PASS / FAIL
npm run lint : PASS / FAIL
npm test : PASS / FAIL
npm run build : PASS / FAIL
npm run test:e2e : PASS / FAIL
npm run test:perf : PASS / FAIL

Problèmes observés :
- ...

Captures :
- ...
```

Récupérer le commit :

```bash
git rev-parse --short HEAD
```

---

## 15. Dépannage

### Le build Docker échoue avec ECONNRESET

Relancer :

```bash
docker compose build --no-cache
docker compose up -d
```

Les Dockerfiles disposent de retries et timeouts npm renforcés.

### RabbitMQ ne démarre pas / erreur .erlang.cookie

Repartir proprement :

```bash
docker compose down --remove-orphans -v
docker compose up -d --build
```

Puis :

```bash
docker compose ps rabbitmq
docker compose logs --tail=100 rabbitmq
```

RabbitMQ doit devenir `healthy`.

Le cookie Erlang défini dans `compose.yaml` est uniquement un réglage de démonstration. Dans un environnement réel, il devra être fourni via un secret.

### Un port est déjà utilisé

Identifier le conteneur :

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Ne pas arrêter un conteneur d'un autre projet sans avoir identifié précisément le conflit.

---

## 16. Arrêter ou réinitialiser Collector.shop

Arrêt normal :

```bash
docker compose down --remove-orphans
```

Remise à zéro complète :

```bash
docker compose down --remove-orphans -v
```

La seconde commande supprime aussi les bases et les données RabbitMQ locales du prototype.

---

## 17. Suite du projet

Après validation collective de cette recette :

1. finaliser les derniers contrôles sécurité dans GitHub Actions (#11 / #5) ;
2. réaliser la démonstration Jenkins (#12) ;
3. exécuter et conserver les résultats E2E / performance (#13) ;
4. déployer l'architecture microservices sur Kubernetes / Kind (#14) ;
5. finaliser politique et scans sécurité (#5) ;
6. finaliser Keycloak vs Auth0 ;
7. réaliser la finition UX/UI du site (#30) ;
8. préparer PPT, démonstrations et répétition (#6).
