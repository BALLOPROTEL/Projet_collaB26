# Démonstration Jenkins — Collector.shop

## Objectif

Jenkins est la seconde solution CI/CD de démonstration de Collector.shop. Le scénario reste comparable à GitHub Actions : récupération du code, installation, qualité, tests, audit de dépendances, build, construction des images Docker et recette distribuée.

L'instance est volontairement **locale et pédagogique**. Elle ne doit pas être considérée comme une configuration Jenkins de production.

## 1. Préparer le poste

Le dépôt doit être à jour et Docker doit fonctionner.

```bash
git checkout main
git pull --ff-only
docker version
docker compose version
```

Arrêter la stack Collector.shop lancée manuellement avant la démonstration Jenkins afin d'éviter les conflits de noms de conteneurs :

```bash
docker compose down --remove-orphans
```

## 2. Démarrer Jenkins

```bash
docker compose -f compose.jenkins.yaml up -d --build
```

Suivre le démarrage :

```bash
docker compose -f compose.jenkins.yaml ps
docker compose -f compose.jenkins.yaml logs -f jenkins
```

Accès :

```text
http://localhost:8083
```

Compte pédagogique par défaut :

```text
Utilisateur : admin
Mot de passe : CollectorDemo2026!
```

Il est possible de remplacer ces valeurs au démarrage :

```bash
JENKINS_ADMIN_ID=collector \
JENKINS_ADMIN_PASSWORD='MonMotDePasseDemo' \
docker compose -f compose.jenkins.yaml up -d --build
```

## 3. Pipeline créé automatiquement

Jenkins Configuration as Code crée automatiquement le job :

```text
collector-shop
```

Le job pointe vers :

```text
https://github.com/BALLOPROTEL/Projet_collaB26.git
branche : main
script : Jenkinsfile
```

Aucune création manuelle du job n'est nécessaire.

## 4. Pipeline nominal

Dans Jenkins :

1. ouvrir `collector-shop` ;
2. cliquer **Build with Parameters** ;
3. laisser `DEMO_FAILURE=false` ;
4. lancer le build.

Étapes attendues :

```text
Checkout
  ↓
Repository structure
  ↓
Install dependencies
  ↓
Lint
  ↓
Unit tests
  ↓
Build workspaces
  ↓
Dependency security audit
  ↓
Build container images
  ↓
Distributed integration
```

La dernière étape démarre réellement les microservices et exécute :

```bash
bash scripts/test-microservices.sh
```

Le résultat nominal attendu est :

```text
RECETTE MICROSERVICES: PASS
Collector.shop Jenkins pipeline succeeded.
```

## 5. Démonstration d'un pipeline bloqué

Relancer **Build with Parameters** avec :

```text
DEMO_FAILURE=true
```

Après les contrôles réels, le pipeline exécute volontairement :

```bash
npm run ci:demo-failure
```

Le build Jenkins doit devenir rouge.

Cette démonstration permet d'expliquer qu'un pipeline CI ne se contente pas d'exécuter des commandes : un contrôle bloquant empêche la livraison d'être considérée comme valide.

## 6. Comparaison avec GitHub Actions

Les deux outils couvrent le même noyau :

| Étape | GitHub Actions | Jenkins |
|---|---|---|
| Checkout | Oui | Oui |
| Installation npm | Oui | Oui |
| Lint ESLint | Oui | Oui |
| Tests unitaires | Oui | Oui |
| Audit npm | Oui | Oui |
| Build | Oui | Oui |
| Images Docker | Oui | Oui |
| Recette microservices | Oui | Oui |
| Échec volontaire | Oui | Oui |
| E2E Playwright | Oui | Pas dans la démo Jenkins actuelle |

GitHub Actions reste le pipeline principal du projet. Jenkins sert de seconde implémentation comparative auto-hébergée.

## 7. Particularité Docker de la démo

Jenkins accède au moteur Docker du poste grâce au montage :

```text
/var/run/docker.sock
```

Cela donne au conteneur Jenkins des privilèges très importants sur le moteur Docker de la machine. **Ce choix est acceptable uniquement pour la démonstration locale du projet.**

Dans un environnement professionnel, on privilégierait un agent Jenkins isolé, des runners dédiés ou une stratégie de build plus cloisonnée.

## 8. Nettoyage

Arrêter Jenkins sans supprimer son historique :

```bash
docker compose -f compose.jenkins.yaml down
```

Supprimer également les données Jenkins :

```bash
docker compose -f compose.jenkins.yaml down -v
```

Le pipeline nettoie lui-même les conteneurs applicatifs Collector.shop après chaque exécution.

## 9. Preuves à conserver pour la soutenance

Captures recommandées :

- page du job `collector-shop` ;
- vue des stages d'un pipeline vert ;
- console avec `RECETTE MICROSERVICES: PASS` ;
- pipeline volontairement rouge avec `DEMO_FAILURE=true` ;
- comparaison GitHub Actions / Jenkins.

Ces captures seront utilisées plus tard dans le support final de soutenance.
