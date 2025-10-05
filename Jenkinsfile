pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Set TAG') {
      steps {
        script {
          env.IMAGE_TAG = powershell(
            script: '(git rev-parse --short=7 HEAD).Trim()',
            returnStdout: true
          ).trim()
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
            $u = "qlirimkastrati"
            $t = $env:DOCKERHUB_TOKEN.Trim()
            if ([string]::IsNullOrWhiteSpace($t)) { throw "Docker token is empty" }

            $t | docker login -u $u --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

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
    always { echo 'Pipeline finished.' }
  }
}
