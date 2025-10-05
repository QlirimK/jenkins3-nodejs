pipeline {
  agent any

  options {
    timestamps()
    skipDefaultCheckout(true)
  }

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {

    stage('Checkout') {
      steps {
        git branch: 'main',
            credentialsId: 'github-token',
            url: 'https://github.com/QlirimK/jenkins3-nodejs.git'
      }
    }

    stage('Set TAG') {
      steps {
        script {
          dir(env.WORKSPACE) {
            // HEAD versuchen
            def out = bat(returnStdout: true, script: '@echo off\r\ngit rev-parse --short=7 HEAD').trim()
            def lines = out.readLines()
            def sha = lines ? lines[-1].trim() : ''

            // Fallback auf FETCH_HEAD, falls nötig
            if (!(sha ==~ /[0-9a-fA-F]{7}/)) {
              def out2 = bat(returnStdout: true, script: '@echo off\r\ngit rev-parse --short=7 FETCH_HEAD').trim()
              def lines2 = out2.readLines()
              sha = lines2 ? lines2[-1].trim() : ''
            }

            if (!(sha ==~ /[0-9a-fA-F]{7}/)) {
              error 'Konnte IMAGE_TAG nicht bestimmen (weder HEAD noch FETCH_HEAD).'
            }

            env.IMAGE_TAG = sha.toLowerCase()
            echo "IMAGE_TAG = ${env.IMAGE_TAG}"
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        // Windows: env-Variablen in Groovy-String sind ok
        bat "docker --version"
        bat "docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} -t ${env.IMAGE_NAME}:latest ."
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-pat', variable: 'DOCKER_PAT')]) {
          powershell '''
            $ErrorActionPreference = "Stop"
            try {
              docker logout 2>$null | Out-Null
              $user  = "qlirimkastrati"
              $token = $env:DOCKER_PAT
              if ([string]::IsNullOrWhiteSpace($token)) { throw "DOCKER_PAT ist leer" }

              # Login via stdin
              $token | docker login -u $user --password-stdin

              docker push "${env:IMAGE_NAME}:${env:IMAGE_TAG}"
              docker push "${env:IMAGE_NAME}:latest"
            }
            finally {
              docker logout 2>$null | Out-Null
            }
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
    }
  }
}
