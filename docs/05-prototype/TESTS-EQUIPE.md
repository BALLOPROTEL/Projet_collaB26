# Feuille de route de test — Équipe Collector.shop

Ce document permet aux 5 membres de l'équipe de tester le même prototype localement, avec les mêmes accès et les mêmes critères de validation.

## 1. Préparer son poste

Prérequis :
- Git
- Docker + Docker Compose
- Node.js 20 ou supérieur
- npm

Cloner le projet :

```bash
git clone https://github.com/BALLOPROTEL/Projet_collaB26.git
cd Projet_collaB26
```

Si le projet est déjà cloné :

```bash
git checkout main
git pull --ff-only
```

Installer les dépendances :

```bash
npm install
```

Créer le fichier d'environnement local du backend :

```bash
cp -f apps/api/.env.example apps/api/.env
```

Vérifier :

```bash
cat apps/api/.env
```

Valeurs attendues :

```env
PORT=3000
DATABASE_URL=postgresql://collector:collector_dev@localhost:5434/collector
KEYCLOAK_ISSUER=http://localhost:8082/realms/collector
CORS_ORIGIN=http://localhost:5173
```

## 2. Démarrer PostgreSQL et Keycloak

```bash
docker compose down
docker compose up -d postgres keycloak
docker compose ps
```

Ports attendus :
- PostgreSQL : `127.0.0.1:5434 -> 5432`
- Keycloak : `127.0.0.1:8082 -> 8080`

Tester PostgreSQL :

```bash
docker exec collector-postgres \
  psql -U collector -d collector \
  -c "SELECT current_database(), current_user;"
```

Attendre Keycloak :

```bash
until curl -fsS \
  http://localhost:8082/realms/collector/.well-known/openid-configuration \
  >/dev/null; do
  echo "J'attends Keycloak..."
  sleep 2
done

echo "Keycloak OK"
```

## 3. Démarrer le backend

Terminal 1 :

```bash
npm run dev:api
```

Résultat attendu :

```text
Collector API listening on http://localhost:3000
```

Tester :

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/catalog
```

## 4. Démarrer le frontend

Terminal 2 :

```bash
npm run dev:web
```

Ouvrir :

```text
http://localhost:5173
```

## 5. Accès de démonstration

### Utilisateur standard

- identifiant : `user1`
- mot de passe : `User123!`
- rôle : `USER`

### Administrateur

- identifiant : `admin1`
- mot de passe : `Admin123!`
- rôles : `USER`, `ADMIN`

### Console Keycloak

- URL : http://localhost:8082/admin/
- identifiant : `admin`
- mot de passe : `Admin123!`

Ces comptes sont uniquement destinés à l'environnement pédagogique local.

## 6. Tests communs obligatoires pour toute l'équipe

Chaque membre valide les points suivants :

| Test | Résultat attendu |
|---|---|
| Frontend | `http://localhost:5173` s'affiche |
| Health API | `/api/health` retourne `status: ok` |
| Catalogue public | les 3 objets de démonstration sont visibles |
| Connexion USER | `user1` peut se connecter |
| Espace USER | les informations utilisateur sont visibles |
| Création d'annonce | une nouvelle annonce peut être créée |
| Sécurité USER | USER n'accède pas à l'administration |
| Connexion ADMIN | `admin1` peut se connecter |
| Administration | ADMIN peut lancer le test d'accès admin |
| Tests unitaires | `npm test` passe |
| Build | `npm run build` passe |

Commandes :

```bash
npm test
npm run build
```

## 7. Tests par rôle

### Seydou — Lead Dev

Responsabilité : vérifier la cohérence globale du prototype.

À valider :
- frontend et backend démarrent sans erreur ;
- `/api/health` répond ;
- `/api/catalog` répond ;
- création d'annonce fonctionne ;
- USER / ADMIN respectent les droits attendus ;
- `npm test` passe ;
- `npm run build` passe ;
- aucune régression évidente avant intégration.

### Nouhaila — DevOps

Responsabilité : vérifier l'exécution et l'automatisation.

À valider :
- `docker compose up -d postgres keycloak` fonctionne ;
- PostgreSQL est healthy ;
- Keycloak répond sur le port 8082 ;
- GitHub Actions exécute tests, build et smoke test ;
- observer dans GitHub Actions le job `Local stack smoke test` ;
- préparer ensuite Jenkins avec le même scénario ;
- préparer ensuite l'image et le déploiement Kubernetes/Kind.

### Yvan — Architecte

Responsabilité : vérifier que l'implémentation respecte l'architecture.

À valider :
- navigateur → frontend ;
- frontend → API ;
- API → PostgreSQL ;
- authentification déléguée à Keycloak ;
- rôles traités côté backend ;
- catalogue accessible sans connexion ;
- fonctions privées protégées ;
- composants suffisamment séparés pour évoluer.

Noter tout écart entre le schéma `docs/03-architecture/architecture-macroscopique.md` et le prototype.

### Oumou — Sécurité

Responsabilité : tester les contrôles de sécurité du prototype.

À valider :
- une route privée sans jeton retourne `401` ;
- USER peut accéder à son espace ;
- USER reçoit `403` sur l'administration ;
- ADMIN accède à l'administration ;
- rôles visibles dans Keycloak ;
- aucune vraie donnée personnelle ou bancaire n'est utilisée ;
- lancer :

```bash
npm audit
```

Puis définir les scans de sécurité à intégrer dans le pipeline.

### Roger — Product Owner

Responsabilité : vérifier les parcours fonctionnels.

À valider :
- le catalogue est visible sans connexion ;
- la connexion utilisateur est compréhensible ;
- un utilisateur connecté peut créer une annonce ;
- l'annonce apparaît ensuite dans le catalogue ;
- l'expérience USER et ADMIN est distincte ;
- les comportements observés correspondent au cadrage fonctionnel.

Important : le prototype n'implémente pas encore toutes les fonctions de la marketplace finale. Paiement, chat, notifications, recommandations avancées, modération complète et fraude restent principalement représentés dans le cadrage/architecture et ne font pas partie du prototype minimal actuel.

## 8. Compte rendu de test à partager

Chaque membre envoie dans le groupe un retour sous cette forme :

```text
Nom :
Rôle :
Commit testé : <git rev-parse --short HEAD>

Frontend : PASS / FAIL
Backend health : PASS / FAIL
Catalogue : PASS / FAIL
Connexion USER : PASS / FAIL
Création annonce : PASS / FAIL
Restriction admin USER : PASS / FAIL
Connexion ADMIN : PASS / FAIL
Admin : PASS / FAIL
npm test : PASS / FAIL
npm run build : PASS / FAIL

Problèmes observés :
- ...

Capture(s) éventuelle(s) :
- ...
```

Pour récupérer le commit testé :

```bash
git rev-parse --short HEAD
```

## 9. Arrêter l'environnement

```bash
docker compose down
```

Pour supprimer également les données locales Collector :

```bash
docker compose down -v
```

## 10. Suite du projet après validation collective

Une fois que les 5 membres ont testé le prototype :

1. finaliser GitHub Actions (#11) ;
2. réaliser la démonstration Jenkins (#12) ;
3. compléter les tests E2E et performance (#13) ;
4. conteneuriser et déployer avec Kubernetes/Kind (#14) ;
5. réaliser la politique de sécurité et les scans (#5) ;
6. finaliser la démonstration comparative Keycloak / Auth0 ;
7. assembler les démos, schémas et résultats dans le PPT (#6) ;
8. faire une répétition chronométrée de la soutenance.
