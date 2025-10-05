pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  environment {
    DOCKERHUB_USER = 'qlirimkastrati'
    IMAGE_NAME     = 'qlirimkastrati/jenkins3-nodejs'
    IMAGE_TAG      = '' // wird in "Set TAG" gesetzt
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Set TAG') {
      steps {
        script {
          // 1) Versuch: Jenkins-Umgebungsvariable vom Checkout
          def sha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : ''

          // 2) Fallback: direkt mit git (saubere Ausgabe dank @echo off)
          if (!sha?.trim()) {
            sha = bat(returnStdout: true, script: '@echo off\r\ngit rev-parse --short=7 HEAD').trim()
          }

          if (!sha?.trim()) {
            error 'Konnte IMAGE_TAG nicht bestimmen (git rev-parse lieferte nichts).'
          }

          env.IMAGE_TAG = sha
          echo "IMAGE_TAG = ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-pat', variable: 'DOCKERHUB_TOKEN')]) {
          powershell '''
            $ErrorActionPreference = "Stop"

            $u = $env:DOCKERHUB_USER
            $t = $env:DOCKERHUB_TOKEN.Trim()
            if ([string]::IsNullOrWhiteSpace($t)) { throw "Docker token is empty" }

            # Login via PAT
            $t | docker login -u $u --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            # Push
            docker push "$env:IMAGE_NAME:$env:IMAGE_TAG"
            if ($LASTEXITCODE -ne 0) { throw "push tag failed" }

            docker push "$env:IMAGE_NAME:latest"
            if ($LASTEXITCODE -ne 0) { throw "push latest failed" }
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
      powershell 'docker logout'  // optional
    }
  }
}
