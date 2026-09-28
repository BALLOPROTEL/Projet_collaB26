# Projet collaboratif 2026 — Collector.shop

## Objectif

Transformer les consignes CESI en un projet concret autour de **Collector.shop**, une application web de vente d’objets de collection entre particuliers.

Le livrable final comprend :
- un support PPT avec les schémas demandés ;
- une démarche de développement DevSecOps ;
- une architecture macroscopique de l’application ;
- une comparaison et une démonstration de **2 solutions CI/CD** ;
- une comparaison et une démonstration de **2 technologies applicatives** ;
- une architecture d’environnement managé / orchestrateur ;
- une stratégie de tests intégrée au CI/CD ;
- une politique de sécurité ;
- une présentation de 20 min suivie de 15 min de questions, avec une part importante consacrée aux démonstrations.

## Équipe et branches

| Membre | Rôle | Branche |
|---|---|---|
| Seydou | Lead Dev | `feat/seydou-lead-dev` |
| Nouhaila | DevOps | `feat/nouhaila-devops` |
| Yvan | Architecte | `feat/yvan-architecture` |
| Oumou | Sécurité | `feat/oumou-security` |
| Roger | Product Owner | `feat/roger-product-owner` |

## État d'avancement

| Étape | Statut |
|---|---|
| #1 Roger / Product Owner — cadrage fonctionnel | ✅ Terminé |
| #2 Seydou / Lead Dev — qualité et DevSecOps | ✅ Terminé |
| #3 Yvan / Architecte — architecture macroscopique | ✅ Terminé |
| #4 Nouhaila / DevOps — CI/CD, tests, orchestrateur | 🟡 En cours |
| #5 Oumou / Sécurité — politique de sécurité | ⏳ À faire |
| #6 Équipe — PPT, démos et soutenance | ⏳ À faire |

## Répartition principale

### Seydou — Lead Dev
- coordonner les choix techniques ;
- formaliser le cycle de développement DevSecOps avec Nouhaila ;
- définir les standards de qualité logicielle ;
- piloter l’intégration des contributions ;
- participer aux démonstrations et à la synthèse finale.

### Nouhaila — DevOps
- comparer 2 solutions CI/CD ;
- réaliser les démonstrations CI/CD ;
- définir le pipeline : build, tests, scans, déploiement ;
- préparer l’architecture de l’environnement managé / orchestrateur ;
- contribuer au monitoring et à l’observabilité.

### Yvan — Architecte
- produire le schéma macroscopique de Collector.shop sans imposer de technologies dans le premier schéma ;
- identifier les composants et leurs interactions ;
- vérifier les exigences de performance, fiabilité, maintenabilité, évolutivité et intégration ;
- cadrer la comparaison des 2 technologies applicatives.

### Oumou — Sécurité
- définir la politique de sécurité ;
- intégrer la sécurité au cycle DevSecOps ;
- prévoir scans, supervision, gestion des risques et gestion des incidents ;
- traiter les contraintes liées aux comptes, paiements, données personnelles, fraude et modération.

### Roger — Product Owner
- formaliser les besoins fonctionnels et les priorités ;
- maintenir le périmètre V1 ;
- définir les profils et parcours : visiteur, acheteur, vendeur, administrateur ;
- préparer les critères d’acceptation et la cohérence fonctionnelle des démonstrations ;
- contribuer au PPT et au retour d’expérience.

## Backlog global

1. Organisation du groupe et cadrage Collector.shop.
2. Exigences fonctionnelles et non fonctionnelles.
3. Attributs de qualité logicielle et justification.
4. Cycle DevSecOps et interactions entre les métiers.
5. Architecture macroscopique de Collector.shop.
6. Comparaison + démonstration de 2 solutions CI/CD.
7. Comparaison + démonstration de 2 technologies applicatives.
8. Architecture de l’environnement managé / orchestrateur.
9. Stratégie de tests et intégration dans le pipeline.
10. Politique de sécurité, scans, supervision, risques et incidents.
11. Finalisation des démonstrations.
12. PPT, répétition de la soutenance et retour d’expérience.

## Plan d'implémentation ajouté après l'architecture

Les tâches suivantes transforment maintenant la documentation en prototype réellement testable :

- **#10 — Prototype Collector.shop V1** : frontend, backend/API, catalogue, authentification, rôles, annonce minimale, données et endpoint de santé.
- **#11 — GitHub Actions** : pipeline réel du prototype.
- **#12 — Jenkins** : seconde démonstration CI/CD sur le même scénario.
- **#13 — Tests** : unitaires, intégration, API, autorisations, smoke et performance ciblée.
- **#14 — Kubernetes/Kind** : conteneurisation et déploiement local orchestré.

## Choix DevOps préparatoires

- CI/CD principal : **GitHub Actions**
- CI/CD comparatif : **Jenkins**
- Orchestrateur : **Kubernetes**
- Environnement local proposé pour la démonstration : **Kind**

Le pipeline cible suit la chaîne :

**Commit / PR → qualité → tests unitaires → tests d’intégration → scans sécurité → build → packaging → déploiement test → smoke tests**

## Fonctions minimales à prendre en compte

Collector.shop doit notamment couvrir :
- catalogue public ;
- inscription et authentification pour acheter/vendre ;
- profils acheteur et vendeur ;
- boutiques virtuelles et publication d’articles ;
- photos, descriptions, prix et frais de port ;
- contrôle/modération des annonces ;
- chat acheteur-vendeur avec limitation du partage de coordonnées personnelles ;
- paiement par carte via la plateforme ;
- notifications et suivi des changements de prix ;
- recommandations selon les centres d’intérêt ;
- administration/back-office ;
- préparation à l’intégration d’un système de détection de fraude ;
- internationalisation et accessibilité ;
- capacité d’évolution rapide.

## Règles Git

- `main` reste la branche d’intégration.
- Chaque membre travaille sur sa branche dédiée.
- Les changements significatifs passent par une Pull Request vers `main`.
- Chaque PR doit expliquer le besoin traité, les choix effectués et les éléments à démontrer.
- Éviter les gros commits mélangés : une modification logique = un commit clair.

## Définition de terminé

Une tâche est considérée comme terminée si :
- le livrable est présent dans le dépôt ;
- le choix est justifié ;
- le schéma ou la documentation est compréhensible ;
- la démonstration associée fonctionne si elle est requise ;
- les impacts sécurité et qualité ont été vérifiés ;
- la contribution est prête à être présentée à l’oral.
