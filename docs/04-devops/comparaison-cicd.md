# Comparaison CI/CD — GitHub Actions vs Jenkins

**Responsable :** Nouhaila — DevOps  
**Branche :** `feat/nouhaila-devops`

## Objectif

Les consignes CESI demandent de sélectionner et comparer deux solutions CI/CD, d'en présenter les forces, faiblesses et limites, puis de démontrer leur fonctionnement.

Pour Collector.shop, l'équipe retient :

- **GitHub Actions**
- **Jenkins**

Ce choix permet de comparer une solution CI/CD fortement intégrée à GitHub avec une solution d'automatisation auto-hébergeable et très personnalisable.

## Critères de comparaison

| Critère | GitHub Actions | Jenkins |
|---|---|---|
| Intégration avec le dépôt | Native avec GitHub | Nécessite configuration et connexion au dépôt |
| Mise en route | Rapide via un fichier workflow YAML | Plus lourde : serveur, plugins, credentials et pipeline |
| Administration | Faible pour un projet simple | Plus importante |
| Flexibilité | Très bonne pour les workflows GitHub | Très forte et extensible |
| Hébergement | Exécutants GitHub ou runners auto-hébergés | Généralement auto-hébergé |
| Maintenance | Faible côté plateforme | L'équipe doit maintenir le serveur et les plugins |
| Sécurité des secrets | Secrets GitHub et permissions du workflow | Credentials Jenkins et configuration serveur |
| Reproductibilité | Workflow versionné dans le dépôt | Jenkinsfile versionnable, mais l'instance Jenkins reste à administrer |
| Démonstration pédagogique | Très simple à montrer directement depuis le dépôt | Intéressante pour montrer un outil CI historique et auto-administré |
| Limites principales | Dépendance à GitHub et quotas/contraintes du service | Charge d'exploitation et risque de mauvaise configuration |

## Forces et limites

### GitHub Actions

**Forces**
- déclenchement naturel sur push et pull request ;
- workflow stocké avec le code ;
- intégration simple avec les contrôles de Pull Request ;
- gestion des secrets centralisée ;
- peu d'infrastructure à maintenir pour la démonstration.

**Limites**
- dépendance à la plateforme GitHub ;
- certaines capacités dépendent des limites d'exécution et de l'offre utilisée ;
- des workflows mal configurés peuvent accorder trop de permissions.

### Jenkins

**Forces**
- forte liberté de configuration ;
- nombreuses possibilités d'intégration ;
- pipeline versionnable via un `Jenkinsfile` ;
- maîtrise de l'environnement d'exécution lorsqu'il est auto-hébergé.

**Limites**
- installation et maintenance à la charge de l'équipe ;
- gestion des plugins à surveiller ;
- configuration de sécurité et des credentials plus exigeante ;
- démonstration plus lourde à préparer.

## Choix de référence pour Collector.shop

Pour le prototype, **GitHub Actions est retenu comme pipeline principal**, car le dépôt est déjà hébergé sur GitHub et l'équipe pourra montrer simplement les contrôles déclenchés à chaque Pull Request.

**Jenkins sera utilisé comme seconde solution de démonstration comparative**, avec le même scénario de pipeline afin que la comparaison soit équitable.

## Même scénario à démontrer dans les deux solutions

Le pipeline devra exécuter, dans le même ordre logique :

1. récupération du code ;
2. installation des dépendances ;
3. contrôles de qualité ;
4. tests unitaires ;
5. tests d'intégration ;
6. scans de sécurité ;
7. build ;
8. packaging ;
9. éventuellement création d'une image conteneur ;
10. déploiement vers un environnement de démonstration.

## Critères d'acceptation des deux démonstrations

- le pipeline se déclenche sur une modification contrôlée ;
- une erreur de test fait échouer le pipeline ;
- un pipeline valide produit un build ou artefact ;
- les étapes sont visibles et compréhensibles pendant la soutenance ;
- les deux solutions exécutent un scénario comparable ;
- l'équipe peut expliquer les écarts d'exploitation, de maintenance et d'intégration.
