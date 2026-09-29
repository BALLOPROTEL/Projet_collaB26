# Migration V1 → microservices

## Objectif

La V1 initiale utilisait un backend unique. La migration introduit des services réellement séparés afin d'aligner le prototype avec l'architecture microservices attendue pour la démonstration.

## Avant

```text
Frontend
   |
Backend API unique
   |
PostgreSQL
   +
Keycloak
```

## Après

```text
Frontend
   |
API Gateway
   |--------------------|
Catalog Service     Listing Service
   |                    |
Catalog DB          Listing DB
                        |
                     RabbitMQ
                    /        \
          Catalog projection  Notification Service

Keycloak -> identité / rôles
```

## Critères prouvant qu'il s'agit de microservices

- processus Node.js distincts ;
- Dockerfiles distincts ;
- services déployables indépendamment ;
- bases Catalog et Listing séparées ;
- contrat HTTP via Gateway ;
- échange asynchrone via RabbitMQ ;
- aucun accès direct entre bases ;
- healthcheck propre à chaque service ;
- possibilité de scaler/déployer chaque composant séparément.

## Ancien backend

Le dossier `apps/api` correspond à la V1 monolithique et est désormais **legacy**. Il n'est plus inclus dans les workspaces npm ni utilisé par Docker Compose. Il pourra être supprimé après la recette de migration.
