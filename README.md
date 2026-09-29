# Projet collaboratif 2026 — Collector.shop

## Objectif

Collector.shop est le prototype technique d'une marketplace C2C d'objets de collection. Le projet sert de support aux livrables CESI : architecture, DevSecOps, CI/CD, tests, sécurité, orchestration et démonstrations.

## Architecture actuelle

Le prototype a d'abord été validé sous forme de backend monolithique V1. Il fonctionne désormais avec une **architecture microservices réelle et validée** :

- Frontend Web ;
- API Gateway ;
- Catalog Service + base dédiée ;
- Listing Service + base dédiée ;
- Notification Service ;
- RabbitMQ pour les événements ;
- Keycloak pour l'identité et les rôles.

Le schéma technique détaillé est dans `docs/03-architecture/architecture-technique-microservices.md`.

## Équipe

| Membre | Rôle |
|---|---|
| Seydou | Lead Dev |
| Nouhaila | DevOps |
| Yvan | Architecte |
| Oumou | Sécurité |
| Roger | Product Owner |

## État d'avancement

| Étape | Statut |
|---|---|
| #1 Product Owner — cadrage fonctionnel | ✅ Terminé |
| #2 Lead Dev — qualité / DevSecOps | ✅ Terminé |
| #3 Architecture macroscopique | ✅ Terminé |
| #10 Prototype monolithique V1 | ✅ Terminé |
| #19 Migration microservices | ✅ Terminé |
| #11 GitHub Actions | 🟡 En cours |
| #12 Jenkins | ⏳ À faire |
| #13 Tests | 🟡 En cours |
| #14 Kubernetes / Kind | 🟡 Conteneurisation terminée, Kind à faire |
| #5 Sécurité | ⏳ À faire |
| #6 PPT / démos / soutenance | ⏳ À faire |

## Architecture microservices

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

Keycloak -> authentification / rôles
```

Le principe **database per service** est appliqué : Catalog et Listing ne partagent ni tables ni accès directs aux bases.

## Démarrage rapide

```bash
git checkout main
git pull --ff-only
npm install
docker compose up -d --build
docker compose ps
```

Accès principaux :
- frontend : http://localhost:5173
- API Gateway : http://localhost:3000
- Keycloak : http://localhost:8082
- RabbitMQ management : http://localhost:15674

Guide de recette microservices : `docs/05-prototype/TESTS-MICROSERVICES.md`.

## CI/CD et orchestration

Choix :
- GitHub Actions ;
- Jenkins ;
- Kubernetes ;
- Kind pour la démonstration locale.

Pipeline cible :

**Commit / PR → qualité → tests → scans sécurité → build → images → déploiement → smoke tests**

## Règles Git

- `main` reste la branche d'intégration.
- Chaque modification significative passe par une branche et une Pull Request.
- Une PR doit expliquer le besoin, les choix et les éléments testables.
- Les tests automatisés doivent être verts avant fusion.

## Définition de terminé

Une tâche est terminée lorsque :
- le livrable est présent ;
- le choix est justifié ;
- les tests associés passent ;
- la démonstration fonctionne si elle est requise ;
- les impacts sécurité / qualité sont identifiés ;
- la contribution est présentable à l'oral.
