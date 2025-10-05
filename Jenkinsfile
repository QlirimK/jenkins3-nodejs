pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {
    stage('Set TAG') {
      steps {
        script {
          // kurze Commit-ID als Tag
          env.IMAGE_TAG = bat(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
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
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-token',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          powershell '''
            $ErrorActionPreference = "Stop"

            Write-Host ("Login as: {0}" -f $env:DOCKER_USER)
            $env:DOCKER_PASS | docker login -u $env:DOCKER_USER --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            docker push $env:IMAGE_NAME:$env:IMAGE_TAG
            if ($LASTEXITCODE -ne 0) { throw "docker push tag failed" }

            docker push $env:IMAGE_NAME:latest
            if ($LASTEXITCODE -ne 0) { throw "docker push latest failed" }
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
