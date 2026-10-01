pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(
      name: 'DEMO_FAILURE',
      defaultValue: false,
      description: 'Déclencher volontairement un échec pour la démonstration'
    )
  }

  environment {
    COMPOSE_PROJECT_NAME = 'collector-jenkins-app'
    API_URL = 'http://api-gateway:3000'
    CATALOG_URL = 'http://catalog-service:3001'
    LISTING_URL = 'http://listing-service:3002'
    NOTIFICATION_URL = 'http://notification-service:3003'
    KEYCLOAK_URL = 'http://keycloak:8080'
    FRONTEND_URL = 'http://web'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Repository structure') {
      steps {
        sh '''
          set -eu
          test -f README.md
          test -f package.json
          test -f compose.yaml
          test -f scripts/test-microservices.sh
          test -f docs/05-prototype/TESTS-EQUIPE.md
          docker compose config -q
          echo "Repository structure OK"
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install --no-package-lock'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Unit tests') {
      steps {
        sh 'npm test'
      }
    }

    stage('Build workspaces') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Dependency security audit') {
      steps {
        sh 'npm audit --audit-level=high'
      }
    }

    stage('Build container images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Distributed integration') {
      steps {
        sh '''
          set -eu

          docker compose down --remove-orphans -v || true
          docker compose up -d

          for i in $(seq 1 90); do
            if docker inspect -f '{{.State.Health.Status}}' collector-api-gateway 2>/dev/null | grep -q healthy; then
              break
            fi
            sleep 2
          done

          docker network connect collector-jenkins-app_default collector-jenkins 2>/dev/null || true

          bash scripts/test-microservices.sh
        '''
      }
    }

    stage('Intentional failure demo') {
      when {
        expression { return params.DEMO_FAILURE }
      }
      steps {
        sh 'npm run ci:demo-failure'
      }
    }
  }

  post {
    always {
      sh '''
        docker network disconnect collector-jenkins-app_default collector-jenkins 2>/dev/null || true
        docker compose down --remove-orphans -v || true
      '''
    }
    success {
      echo 'Collector.shop Jenkins pipeline succeeded.'
    }
    failure {
      echo 'Collector.shop Jenkins pipeline failed as expected when a blocking control fails.'
    }
  }
}
