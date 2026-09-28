# Qualité logicielle — Collector.shop

**Responsable :** Seydou — Lead Dev

## Objectif
Les consignes CESI demandent de sélectionner, définir et justifier les principaux attributs de qualité de Collector.shop.

## Attributs retenus

| Priorité | Attribut | Définition | Justification |
|---|---|---|---|
| 1 | Sécurité | Protéger les comptes, données, échanges et transactions contre les accès ou actions non autorisés. | Collector.shop gère des comptes utilisateurs, des échanges privés et des transactions financières. Le contexte indique que la sécurité est une exigence de premier plan. |
| 2 | Fiabilité | Fournir un comportement correct et prévisible, y compris lorsqu'une opération échoue. | Les paiements, publications d'annonces et notifications doivent rester cohérents. |
| 3 | Disponibilité | Maintenir les fonctions utiles accessibles lorsque les utilisateurs en ont besoin. | Le catalogue, les espaces acheteur/vendeur, le chat et le paiement soutiennent directement les transactions. |
| 4 | Performance | Répondre dans des délais acceptables sous une charge donnée. | Catalogue, recommandations, chat, notifications et back-office doivent rester réactifs lorsque le volume augmente. |
| 5 | Maintenabilité | Permettre de comprendre, corriger, tester et modifier facilement le logiciel. | Le contexte demande de pouvoir faire évoluer rapidement les fonctionnalités. |
| 6 | Évolutivité | Accueillir de nouvelles fonctionnalités et davantage de charge sans refonte complète. | Des évolutions sont prévues : recommandations enrichies, enchères, streaming, bot, détection de fraude et services supports. |
| 7 | Observabilité | Comprendre l'état du système grâce aux journaux, métriques, traces et alertes. | Elle soutient la supervision, la détection d'incidents et l'amélioration continue demandées dans les consignes. |
| 8 | Accessibilité | Rendre l'application utilisable par des personnes ayant différents besoins d'accessibilité. | Le contexte exige explicitement que Collector.shop supporte l'accessibilité. |
| 9 | Internationalisation | Préparer l'application à plusieurs langues, formats ou contextes régionaux sans refonte majeure. | Le contexte exige explicitement que Collector.shop supporte l'internationalisation. |

## Priorité V1 proposée par l'équipe
1. Sécurité
2. Fiabilité
3. Disponibilité
4. Performance
5. Maintenabilité et évolutivité
6. Observabilité
7. Accessibilité et internationalisation

Cette hiérarchie est une proposition de l'équipe destinée à guider l'architecture, le CI/CD, la sécurité et les tests.

## Impacts sur la conception
Les choix techniques devront permettre :
- de séparer clairement les responsabilités des composants ;
- de sécuriser l'authentification, l'autorisation et les données sensibles ;
- de gérer correctement les erreurs et les états des transactions ;
- d'intégrer les tests dans le pipeline CI/CD ;
- de superviser l'application et ses composants ;
- d'ajouter de nouvelles fonctionnalités sans réécriture globale ;
- de prendre en compte l'accessibilité et l'internationalisation dès la conception.

## Synthèse PPT
Collector.shop doit être en priorité **sécurisé, fiable, disponible et performant**. Son architecture doit aussi être **maintenable et évolutive**, avec une observabilité suffisante et une prise en compte de l'accessibilité et de l'internationalisation.