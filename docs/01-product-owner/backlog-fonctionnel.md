# Backlog fonctionnel — Collector.shop

**Product Owner : Roger**

Ce backlog reprend les besoins explicitement décrits dans le contexte Collector.shop. Les éléments « V2 / évolution » sont séparés afin de ne pas les confondre avec le périmètre V1.

## Épics et user stories V1

| ID | Épic | User story | Critère de résultat |
|---|---|---|---|
| US-01 | Catalogue | En tant que visiteur, je veux parcourir le catalogue sans compte afin de découvrir les objets proposés. | Le catalogue est accessible sans authentification. |
| US-02 | Compte | En tant que client, je veux m’inscrire afin de pouvoir acheter ou vendre. | Les fonctions achat/vente nécessitent un compte authentifié. |
| US-03 | Profil | En tant qu’utilisateur, je veux être acheteur et vendeur avec le même compte. | Les deux usages peuvent coexister dans un même espace. |
| US-04 | Espace personnel | En tant qu’utilisateur, je veux suivre mes achats/ventes et leur historique. | Les opérations en cours et passées sont consultables. |
| US-05 | Réputation | En tant qu’utilisateur, je veux noter mon interlocuteur après une transaction. | L’acheteur peut noter le vendeur et inversement. |
| US-06 | Vente | En tant que vendeur, je veux créer plusieurs boutiques virtuelles. | Plusieurs boutiques peuvent être associées au même vendeur particulier. |
| US-07 | Annonce | En tant que vendeur, je veux publier un article avec photos, description, prix et frais de port. | Tous les champs obligatoires sont présents avant soumission. |
| US-08 | Contrôle | En tant que plateforme, je veux contrôler une annonce avant sa mise en vente. | Une annonce non contrôlée ne devient pas publiquement vendable. |
| US-09 | Administration | En tant qu’admin, je veux créer les catégories du site. | Seul l’admin crée les catégories. |
| US-10 | Modération | En tant qu’admin, je veux supprimer les articles ou vendeurs non conformes. | Le back-office permet la modération prévue par la charte. |
| US-11 | Chat | En tant qu’acheteur/vendeur, je veux discuter avec l’autre partie depuis mon espace. | Un chat est accessible aux deux profils. |
| US-12 | Protection des échanges | En tant que plateforme, je veux limiter l’échange de coordonnées personnelles afin de conserver les transactions sur Collector.shop. | Email et téléphone sont bloqués/détectés autant que possible dans les échanges. |
| US-13 | Paiement | En tant qu’acheteur, je veux payer par carte sur Collector.shop. | Le paiement V1 passe par la plateforme et non directement par le vendeur. |
| US-14 | Commission | En tant que Collector.shop, je veux appliquer une commission de 5 % à chaque transaction. | La transaction tient compte de la commission définie. |
| US-15 | Centres d’intérêt | En tant qu’acheteur, je veux paramétrer mes centres d’intérêt. | Les préférences sont modifiables dans le profil. |
| US-16 | Recommandations | En tant qu’acheteur authentifié, je veux recevoir des recommandations selon mes centres d’intérêt. | Les recommandations tiennent compte des préférences déclarées. |
| US-17 | Notifications articles | En tant qu’acheteur, je veux être averti lors de la publication d’un article qui m’intéresse. | Une notification est créée selon les abonnements/centres d’intérêt. |
| US-18 | Préférences notifications | En tant qu’utilisateur, je veux choisir les notifications à recevoir. | Les types de notifications sont paramétrables. |
| US-19 | Email notifications | En tant qu’utilisateur, je veux pouvoir recevoir certaines notifications par email. | L’envoi par email est possible en complément de la liste interne. |
| US-20 | Variation de prix | En tant qu’acheteur intéressé, je veux être averti lorsqu’un prix change. | Le changement est collecté et une notification est produite. |
| US-21 | Fraude | En tant que plateforme, je veux transmettre les variations de prix au composant de détection de fraude. | Le back-office fraude peut recevoir l’information. |
| US-22 | Intégration fraude | En tant que plateforme, je veux pouvoir intégrer un outil de détection de fraude/anomalies. | L’architecture accepte une solution interne ou externe. |
| US-23 | Internationalisation | En tant qu’utilisateur international, je veux que l’application puisse supporter plusieurs contextes linguistiques/régionaux. | L’internationalisation est prise en compte dans la conception. |
| US-24 | Accessibilité | En tant qu’utilisateur, je veux pouvoir utiliser l’application avec des besoins d’accessibilité. | L’accessibilité est une exigence de conception. |

## V2 / évolutions

| ID | Évolution |
|---|---|
| EV-01 | Enrichir les recommandations à partir du parcours du catalogue. |
| EV-02 | Ajouter un système d’enchères. |
| EV-03 | Ajouter des événements Collector avec vente en streaming direct. |
| EV-04 | Ajouter un bot de service avant-vente. |
| EV-05 | Ajouter des services supports tels que l’analyse des ventes pour la direction. |
| EV-06 | Étendre l’automatisation de détection de fraude/anomalies. |
| EV-07 | Automatiser autant que possible l’intégration de publicités ciblées sur des sites partenaires. |

## Synthèse PPT — Product Owner

Pour la soutenance, cette partie peut tenir sur **1 slide** :

**Collector.shop — besoin métier**
- Marketplace C2C d’objets de collection.
- Visiteur, acheteur, vendeur et administrateur/modérateur.
- Catalogue public ; compte obligatoire pour acheter/vendre.
- Paiement par carte via la plateforme ; commission de 5 %.
- Annonces contrôlées avant publication.
- Chat, notifications, recommandations et back-office.
- Sécurité prioritaire en raison des transactions financières.
- Accessibilité, internationalisation et capacité d’évolution intégrées dès la conception.
- Architecture préparée pour la détection de fraude et les futures fonctionnalités.
