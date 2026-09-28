pipeline {
  agent any

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
          test -f docs/01-product-owner/cadrage-collector-shop.md
          test -f docs/02-lead-dev/qualite-logicielle.md
          test -f docs/03-architecture/architecture-macroscopique.md
          test -f docs/04-devops/pipeline-cible.md
          echo "Repository structure OK"
        '''
      }
    }

    stage('Application CI placeholder') {
      when {
        anyOf {
          expression { fileExists('package.json') }
          expression { fileExists('pom.xml') }
          expression { fileExists('build.gradle') }
          expression { fileExists('requirements.txt') }
          expression { fileExists('pyproject.toml') }
        }
      }
      steps {
        echo 'Application detected.'
        echo 'Replace this placeholder with install, lint, tests, security scans and build during prototype implementation.'
      }
    }
  }

  post {
    success {
      echo 'Collector.shop pipeline succeeded.'
    }
    failure {
      echo 'Collector.shop pipeline failed.'
    }
  }
}
