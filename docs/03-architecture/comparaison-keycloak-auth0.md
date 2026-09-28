# Comparaison technique — Keycloak vs Auth0

**Responsable :** Yvan — Architecte  
**Contribution sécurité :** Oumou  
**Contribution Lead Dev :** Seydou

## Pourquoi comparer ces deux solutions ?

Les consignes CESI demandent de comparer deux technologies potentielles pour l'application avec leurs avantages, inconvénients, limites et une démonstration comparative.

Pour Collector.shop, nous retenons comme **cas de comparaison proposé** la gestion de l'identité et de l'autorisation, car l'application possède plusieurs profils et fonctions sensibles : visiteur, acheteur, vendeur, administrateur/modérateur, paiement, chat et back-office.

Les deux solutions étudiées sont :

- **Keycloak**
- **Auth0**

> Ce choix est une proposition technique de l'équipe. Il n'est pas imposé par le contexte CESI.

## Besoin à couvrir

La solution d'identité doit pouvoir soutenir :
- inscription et connexion ;
- gestion des rôles ;
- séparation des droits acheteur, vendeur et administrateur ;
- protection des API ;
- gestion des sessions ;
- possibilité d'évolution sans recréer toute l'authentification dans l'application ;
- intégration avec la démarche de sécurité du projet.

## Matrice de comparaison

| Critère | Keycloak | Auth0 |
|---|---|---|
| Modèle d'exploitation | Solution pouvant être hébergée et administrée par l'équipe | Service d'identité managé dans le cloud |
| Contrôle de l'infrastructure | Fort contrôle sur l'installation, les versions et la configuration | Infrastructure principalement gérée par le fournisseur |
| Mise en route | Demande l'installation et l'administration de la solution | Mise en route généralement rapide via un tenant et une configuration applicative |
| Maintenance | L'équipe doit gérer mises à jour, sauvegardes et disponibilité | Une grande partie de l'exploitation est prise en charge par le service |
| Personnalisation | Très flexible lorsque l'équipe maîtrise la plateforme | Bonne personnalisation, avec certaines limites liées au service managé |
| Dépendance fournisseur | Faible si la solution est auto-hébergée | Plus forte car le service dépend d'un fournisseur externe |
| Coût d'infrastructure | Nécessite des ressources pour l'hébergement et l'exploitation | Le coût dépend du plan et de l'usage du service |
| Démonstration locale | Très adaptée : peut être exécutée localement pour le projet | Nécessite l'utilisation d'un service externe et sa configuration |
| Compétences nécessaires | Administration de la solution et compréhension de l'identité | Compréhension de l'identité et configuration du service |
| Adaptation au projet pédagogique | Très bonne pour montrer concrètement l'infrastructure et les rôles | Très bonne pour illustrer une approche SaaS/managée |

## Avantages et limites

### Keycloak

**Avantages**
- contrôle important sur la configuration et les données ;
- adapté à une démonstration locale reproductible ;
- gestion centralisée des utilisateurs, rôles et clients ;
- possibilité d'intégrer plusieurs applications ou services autour d'une même identité ;
- pas besoin de développer soi-même tout le mécanisme d'authentification.

**Limites**
- l'équipe doit exploiter et maintenir la plateforme ;
- demande davantage de configuration et de compétences opérationnelles ;
- la haute disponibilité et les sauvegardes deviennent la responsabilité de l'équipe.

### Auth0

**Avantages**
- service managé qui réduit la charge d'exploitation ;
- mise en œuvre rapide pour une application web ;
- gestion centralisée des utilisateurs et autorisations ;
- bonne option lorsque l'équipe souhaite déléguer l'infrastructure d'identité.

**Limites**
- dépendance plus forte au fournisseur ;
- certaines possibilités dépendent du plan ou du service ;
- moins de contrôle sur l'infrastructure sous-jacente ;
- la démonstration dépend d'un environnement externe.

## Adéquation à Collector.shop

Les deux solutions peuvent répondre au besoin d'identité de Collector.shop.

Pour **le projet collaboratif et les démonstrations**, Keycloak est retenu comme **solution de référence proposée** car il permet de montrer localement :
- la création des rôles ;
- la connexion d'un utilisateur ;
- la génération d'un jeton ;
- la protection d'une ressource ;
- le comportement autorisé/interdit selon le rôle.

Auth0 reste la solution comparative permettant de montrer l'alternative **service managé**.

Ce choix ne signifie pas qu'Auth0 est moins adapté dans l'absolu : il illustre surtout un arbitrage entre **contrôle et exploitation interne** d'un côté, et **service managé** de l'autre.

## Scénario de démonstration comparative

La démonstration doit utiliser le **même besoin fonctionnel** dans les deux solutions.

### Cas testé
Protéger deux ressources :
- `/account` : accessible à un utilisateur authentifié ;
- `/admin` : accessible uniquement à un administrateur.

### Démonstration Keycloak
1. Démarrer l'environnement Keycloak.
2. Créer/configurer l'espace d'identité du projet.
3. Définir les rôles `USER` et `ADMIN`.
4. Créer deux utilisateurs de démonstration.
5. Authentifier l'utilisateur standard.
6. Montrer l'accès autorisé à `/account`.
7. Montrer l'accès refusé à `/admin`.
8. Authentifier l'administrateur.
9. Montrer l'accès autorisé à `/admin`.

### Démonstration Auth0
1. Configurer l'application dans le tenant Auth0.
2. Créer les rôles équivalents.
3. Créer/associer les utilisateurs de démonstration.
4. Réaliser le même scénario d'authentification.
5. Vérifier les mêmes accès autorisés/refusés.

## Critères de comparaison pendant la démo

Pour ne pas faire une démonstration seulement visuelle, relever pour chaque solution :
- temps et complexité de configuration ;
- clarté de la gestion des rôles ;
- facilité d'intégration à une API ;
- dépendances nécessaires ;
- visibilité sur les utilisateurs et sessions ;
- exploitation nécessaire après installation ;
- reproductibilité de la démonstration.

## Critères d'acceptation

La démonstration est considérée comme réussie si :
- un utilisateur non authentifié ne peut pas accéder aux ressources protégées ;
- un utilisateur standard accède à son espace mais pas à l'administration ;
- un administrateur accède aux deux ressources ;
- les rôles sont gérés par la solution d'identité et non codés en dur dans l'interface ;
- le même scénario est reproduit avec les deux technologies ;
- l'équipe peut expliquer clairement les avantages, limites et différences observées.

## Synthèse PPT

**Slide proposée : “Comparaison de deux solutions d'identité”**

Présenter un tableau court :

| Keycloak | Auth0 |
|---|---|
| Hébergeable par l'équipe | Service managé |
| Plus de contrôle | Moins d'exploitation |
| Plus d'administration | Mise en route plus rapide |
| Très pratique pour la démo locale | Bon exemple d'approche SaaS |

Puis faire la démonstration plutôt que surcharger la slide.

## Décision provisoire

Pour la suite du prototype Collector.shop :

**Solution proposée : Keycloak**, sous réserve de validation collective lors de la revue d'architecture.

Motif principal : la solution est bien adaptée à une démonstration locale, donne de la visibilité sur la gestion des rôles et permet à l'équipe de maîtriser le fonctionnement de l'identité pendant la soutenance.