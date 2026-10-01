# Démonstration GitHub Actions — Collector.shop

## Objectif

La démonstration doit montrer deux situations :

1. un pipeline complet réussi ;
2. un pipeline volontairement en échec afin de prouver qu'une livraison incorrecte est bloquée.

## Démonstration normale

Le workflow `Collector CI` exécute :

- validation de la structure microservices ;
- lint / contrôles qualité ;
- tests unitaires ;
- build ;
- audit des dépendances ;
- démarrage Docker Compose ;
- recette distribuée commune ;
- tests E2E navigateur Playwright ;
- nettoyage de l'environnement.

La recette distribuée valide notamment :

```text
API Gateway
   ↓
Listing Service
   ↓
Listing DB
   ↓
RabbitMQ
  ↙     ↘
Catalog  Notification
```

ainsi que Keycloak, USER / ADMIN et le frontend.

## Démonstration d'un échec volontaire

Le workflow supporte un déclenchement manuel avec l'option `demo_failure=true`.

Dans GitHub :

1. ouvrir **Actions** ;
2. sélectionner **Collector CI** ;
3. cliquer **Run workflow** ;
4. activer **demo_failure** ;
5. lancer le workflow.

Le job `Intentional failure demo` exécute :

```bash
npm run ci:demo-failure
```

et se termine volontairement avec un code différent de zéro.

Le résultat attendu est un workflow rouge. Cela montre au jury qu'un contrôle bloquant empêche le pipeline d'être considéré comme réussi.

Ne pas intégrer une fausse erreur dans le code métier pour réaliser cette démonstration.
