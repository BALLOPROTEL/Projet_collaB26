# Collector.shop dans GitHub Codespaces

Cette configuration permet de développer et démontrer Collector.shop dans le cloud sans conserver
les images Docker, bases PostgreSQL, RabbitMQ, Keycloak, microservices ou `node_modules` sur le PC.

## Architecture exécutée dans le Codespace

La commande `npm run codespaces:up` démarre :

- Catalog PostgreSQL ;
- Listing PostgreSQL ;
- RabbitMQ ;
- Keycloak ;
- Catalog Service ;
- Listing Service ;
- Notification Service ;
- API Gateway ;
- Web Collector.shop.

Les URLs publiques temporaires GitHub Codespaces sont générées à chaque démarrage. Le realm Keycloak
utilisé dans le Codespace est généré dans `.codespaces/` et n'altère pas le realm local suivi par Git.

## Premier démarrage

Dans le terminal du Codespace :

```bash
npm run codespaces:up
npm run codespaces:check
```

Le premier build Docker peut prendre plusieurs minutes.

Ports principaux :

- Web : 5173
- API Gateway : 3000
- Keycloak : 8082
- RabbitMQ Management : 15674

Les services internes Catalog, Listing et Notification restent également disponibles en localhost
sur leurs ports existants pour la recette automatisée.

## Après une modification du code

Le prototype actuel est conteneurisé pour la démonstration. Pour reconstruire les images et rejouer
la recette complète :

```bash
npm run codespaces:rebuild
```

## Jenkins, Playwright et Kubernetes

Ces outils restent dans le dépôt mais ne sont pas démarrés automatiquement dans Codespaces afin
d'économiser le quota gratuit. La CI GitHub continue de valider Jenkins, les tests et la stack
microservices selon le workflow du dépôt.

## Fin de session

Avant de supprimer le Codespace :

```bash
git status
git add .
git commit -m "..."
git push
```

Pour arrêter seulement la stack :

```bash
npm run codespaces:down
```

Supprimer ensuite le Codespace depuis GitHub libère son stockage cloud.
