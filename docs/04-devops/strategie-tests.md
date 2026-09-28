# Stratégie de tests — Collector.shop

**Responsable :** Nouhaila — DevOps  
**Contributions :** Seydou — Lead Dev, Oumou — Sécurité, Roger — Product Owner

## Types de tests retenus

| Type | Objectif | Position dans le pipeline |
|---|---|---|
| Tests unitaires | Vérifier les fonctions et composants isolés | Après lint, avant intégration |
| Tests d'intégration | Vérifier les interactions entre API, données et services | Après les tests unitaires |
| Tests API | Vérifier les contrats et comportements des endpoints | Avec les tests d'intégration |
| Tests d'autorisation | Vérifier les accès selon les rôles | Après disponibilité de l'authentification |
| Tests end-to-end ciblés | Vérifier quelques parcours métier critiques | Après déploiement test |
| Tests de sécurité | Détecter vulnérabilités ou mauvaises configurations | Avant packaging/déploiement |
| Tests de charge/performance | Vérifier le comportement sous charge sur des parcours choisis | Sur environnement de test, pas à chaque petit commit |
| Smoke tests | Vérifier que l'application démarre et répond | Juste après déploiement |

## Parcours prioritaires à tester

Le prototype devra au minimum permettre de tester :

1. accès public au catalogue ;
2. authentification d'un utilisateur ;
3. accès autorisé à un espace utilisateur ;
4. refus d'accès à l'administration pour un utilisateur standard ;
5. accès administrateur ;
6. création ou lecture d'une annonce de démonstration ;
7. santé de l'API après déploiement.

## Politique d'échec

Sont bloquants pour l'intégration :
- erreur de build ;
- test unitaire obligatoire en échec ;
- test d'intégration obligatoire en échec ;
- contrôle de sécurité critique défini par l'équipe ;
- smoke test en échec sur l'environnement de démonstration.

## Données de test

- utiliser des comptes et données fictifs ;
- ne pas utiliser de vraies coordonnées bancaires ou données personnelles ;
- rendre les tests reproductibles ;
- nettoyer ou réinitialiser les données de démonstration si nécessaire.

## Relation avec le Product Owner

Les critères d'acceptation fonctionnels définis par Roger servent de base aux tests métier. Les tests techniques ne remplacent donc pas la validation fonctionnelle.

## Relation avec la sécurité

Les tests d'autorisation, scans et contrôles de configuration seront complétés avec Oumou lors de la tâche Sécurité.
