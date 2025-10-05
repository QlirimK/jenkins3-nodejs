pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  environment {
    DOCKERHUB_USER = 'qlirimkastrati'
    IMAGE_NAME     = 'qlirimkastrati/jenkins3-nodejs'
    IMAGE_TAG      = '' // wird unten gesetzt
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
          // Kurz-SHA sauber auslesen (PowerShell, keine bat-Ausgabe-Präfixe)
          env.IMAGE_TAG = powershell(returnStdout: true, script: '(git rev-parse --short=7 HEAD)').trim()
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

            # Login per PAT
            $t | docker login -u $u --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            # Pushen
            docker push "$env:IMAGE_NAME:$env:IMAGE_TAG"
            if ($LASTEXITCODE -ne 0) { throw "docker push tag failed" }

            docker push "$env:IMAGE_NAME:latest"
            if ($LASTEXITCODE -ne 0) { throw "docker push latest failed" }
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
      // optional aufräumen:
      powershell 'docker logout' 
    }
  }
}
