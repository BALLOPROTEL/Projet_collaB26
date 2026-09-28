# Cadrage fonctionnel — Collector.shop

**Responsable :** Roger — Product Owner  
**Branche :** `feat/roger-product-owner`  
**Source de cadrage :** contexte CESI « Collector » et consignes du projet collaboratif.

## 1. Vision produit

Collector.shop est une application web de vente d’objets de collection entre particuliers. La plateforme met en relation vendeurs et acheteurs, encadre les échanges, sécurise les transactions et prélève une commission de **5 % sur chaque transaction**.

La V1 doit permettre de parcourir le catalogue sans être connecté, puis d’utiliser les fonctions d’achat ou de vente après inscription/authentification.

## 2. Périmètre fonctionnel V1

### Catalogue public
- Consultation du catalogue sans authentification.
- Consultation des fiches articles avec photos, description précise, prix et éventuels frais de port.
- Organisation des articles par catégories administrées depuis le back-office.

### Comptes et profils
- Inscription obligatoire pour acheter ou vendre.
- Un même utilisateur peut être acheteur et vendeur.
- Espace personnel avec :
  - achats et ventes en cours ;
  - historique des achats et ventes ;
  - notation de l’acheteur ou du vendeur ;
  - gestion des notifications ;
  - centres d’intérêt ;
  - accès au chat.

### Vente et boutiques
- Un vendeur peut créer plusieurs boutiques virtuelles.
- Le vendeur reste clairement identifié comme particulier.
- Publication d’un article avec photos, description, prix et frais de port.
- Un article n’est mis en vente qu’après contrôle par Collector.shop.
- Ce contrôle doit être automatisé autant que possible.

### Achat et paiement
- Paiement réalisé à travers Collector.shop.
- V1 : paiement par carte bancaire.
- Paiement direct entre acheteur et vendeur interdit.
- Collector.shop assure un rôle de garantie de qualité du vendeur et de ses produits.

### Chat et modération
- Chat entre acheteur et vendeur depuis leur espace.
- L’administrateur peut assurer un rôle de modération.
- La plateforme doit empêcher autant que possible l’échange direct de coordonnées personnelles, notamment email et numéro de téléphone.

### Notifications
- Notification lors de la mise en ligne d’un article particulier ou correspondant à un centre d’intérêt.
- Paramétrage du type de notification par l’utilisateur.
- Notifications visibles dans l’espace personnel.
- Possibilité d’envoi par email.
- Notification des variations de prix aux acheteurs intéressés.
- Transmission des changements de prix au composant back-office de détection de fraude.

### Recommandations
- Recommandations pour l’acheteur authentifié à partir de ses centres d’intérêt.
- Paramétrage des centres d’intérêt depuis le profil.

### Administration / back-office
- Création des catégories uniquement par l’administrateur.
- Suppression/modération d’articles ou vendeurs ne respectant pas la charte.
- Contrôle des annonces avant publication.
- Préparation de l’intégration avec un outil de détection de fraude ou d’anomalie.

## 3. Profils utilisateurs

| Profil | Capacités principales |
|---|---|
| Visiteur | Parcourir le catalogue et consulter les articles sans authentification. |
| Acheteur | Acheter, payer sur la plateforme, gérer ses centres d’intérêt, recevoir des recommandations/notifications, chatter, suivre ses achats et noter un vendeur. |
| Vendeur | Publier des articles, gérer plusieurs boutiques, suivre ses ventes, chatter, recevoir des notifications et noter un acheteur. |
| Administrateur / Modérateur | Créer les catégories, modérer/supprimer des articles ou vendeurs, contrôler les publications et superviser le back-office. |

Un utilisateur peut cumuler les rôles **acheteur** et **vendeur**.

## 4. Parcours utilisateurs principaux

### Parcours visiteur → acheteur
1. Parcourir le catalogue.
2. Consulter un article.
3. Créer un compte / s’authentifier pour acheter.
4. Effectuer le paiement par carte via Collector.shop.
5. Suivre l’achat dans l’espace personnel.
6. Échanger avec le vendeur via le chat.
7. Noter le vendeur après la transaction.

### Parcours vendeur
1. Créer un compte / s’authentifier.
2. Créer une boutique virtuelle si nécessaire.
3. Créer une annonce avec photos, description, prix et frais de port.
4. Soumettre l’article au contrôle Collector.shop.
5. Publication après validation.
6. Suivre la vente et échanger via le chat.
7. Consulter l’historique et noter l’acheteur.

### Parcours administrateur
1. Gérer les catégories.
2. Contrôler/modérer les annonces.
3. Supprimer les contenus ou vendeurs non conformes.
4. Superviser les signaux utiles à la détection de fraude/anomalie.

## 5. Règles métier

| ID | Règle |
|---|---|
| RM-01 | Collector.shop prélève une commission de 5 % sur chaque transaction. |
| RM-02 | L’inscription est obligatoire pour acheter ou vendre. |
| RM-03 | Le catalogue reste consultable sans authentification. |
| RM-04 | Un utilisateur peut être à la fois acheteur et vendeur. |
| RM-05 | Les catégories sont créées uniquement par l’administrateur. |
| RM-06 | Le paiement direct entre acheteur et vendeur est interdit. |
| RM-07 | En V1, le paiement est effectué par carte bancaire via la plateforme. |
| RM-08 | Une annonce doit comporter au minimum photos, description, prix et frais de port éventuels. |
| RM-09 | Un article n’est publié qu’après contrôle de Collector.shop. |
| RM-10 | Les échanges de coordonnées personnelles dans le chat doivent être empêchés autant que possible. |
| RM-11 | Les changements de prix doivent être historisés/collectés. |
| RM-12 | Les acheteurs intéressés doivent être informés d’un changement de prix. |
| RM-13 | Les changements de prix doivent également alimenter le composant de détection de fraude. |
| RM-14 | Un vendeur peut créer plusieurs boutiques mais doit rester identifié comme vendeur particulier. |

## 6. Exigences non fonctionnelles issues du contexte

### Sécurité
La sécurité est prioritaire car l’application inclut des transactions financières, des comptes utilisateurs, des échanges privés et des données personnelles.

### Accessibilité
Collector.shop doit supporter l’accessibilité.

### Internationalisation
L’application doit supporter l’internationalisation.

### Évolutivité / maintenabilité
L’architecture doit faciliter la mise à jour des fonctionnalités et l’ajout rapide de nouvelles fonctionnalités afin de suivre l’évolution du marché.

### Intégrabilité
La V1 doit permettre l’intégration avec un outil d’automatisation de détection de fraude ou d’anomalie, qu’il soit développé en interne ou acheté.

## 7. Évolutions identifiées

Les éléments suivants sont explicitement présentés comme évolutions ou extensions possibles :
- V2 des recommandations basée également sur le parcours du catalogue ;
- système d’enchères ;
- événements Collector avec vente d’objets en streaming direct ;
- bot de service avant-vente ;
- services supports, par exemple analyse des ventes pour la direction ;
- intégration plus poussée d’un outil de détection de fraude/anomalies ;
- automatisation de publicités ciblées sur des sites partenaires.

Ces éléments ne doivent pas bloquer la V1, mais l’architecture doit pouvoir les accueillir.

## 8. Critères d’acceptation pour les démonstrations

Les démonstrations du projet ne visent pas à livrer toute l’application. Elles doivent cependant montrer que les choix techniques peuvent soutenir le produit.

### CA-01 — Pipeline
Un changement de code déclenche automatiquement le pipeline choisi et produit un résultat visible.

### CA-02 — Qualité
Le pipeline comporte au minimum une étape de validation/test et expose clairement son succès ou son échec.

### CA-03 — Sécurité
Une étape ou un mécanisme de sécurité peut être intégré au cycle CI/CD sans contourner le processus normal de livraison.

### CA-04 — Déploiement
La solution permet de montrer comment l’application ou un composant peut être déployé dans l’environnement cible.

### CA-05 — Architecture
Le schéma d’architecture montre clairement où se placent au minimum le front, le backend, l’authentification, les données, le paiement, les notifications, le chat et l’administration.

### CA-06 — Évolutivité
Les choix d’architecture et de déploiement ne doivent pas empêcher l’ajout futur de nouvelles fonctionnalités telles que fraude, enchères ou recommandations enrichies.

## 9. Hors périmètre de cette tâche

Cette tâche Product Owner cadre le **quoi** et les contraintes fonctionnelles. Elle ne fixe pas :
- le framework backend ;
- le fournisseur de base de données ;
- la solution CI/CD ;
- l’orchestrateur ;
- le serveur d’autorisation ;
- les outils de scans de sécurité.

Ces choix relèvent des tâches Architecture, DevOps, Sécurité et Lead Dev.
