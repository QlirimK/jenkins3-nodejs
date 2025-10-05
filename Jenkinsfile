pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'main',
            url: 'https://github.com/QlirimK/jenkins3-nodejs.git',
            credentialsId: 'github-token'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          def shortSha = powershell(returnStdout: true, script: '(git rev-parse --short=7 HEAD).Trim()').trim()
          env.IMAGE_TAG = shortSha
          echo "IMAGE_NAME=${env.IMAGE_NAME}  IMAGE_TAG=${env.IMAGE_TAG}"
        }
        bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKER_PASS')]) {
          powershell '''
            docker logout 2>$null | Out-Null
            $user = "qlirimkastrati"
            $pass = ($env:DOCKER_PASS -replace "`r|`n","")  # CR/LF sicher entfernen
            Write-Host "Using Docker user: $user"

            $pass | docker login -u $user --password-stdin
            if ($LASTEXITCODE -ne 0) {
              Write-Host "login default registry failed, try registry-1 ..."
              $pass | docker login -u $user --password-stdin registry-1.docker.io
              if ($LASTEXITCODE -ne 0) { Write-Error "docker login failed"; exit $LASTEXITCODE }
            }

            docker push "$env:IMAGE_NAME:$env:IMAGE_TAG" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
            docker push "$env:IMAGE_NAME:latest"         ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

            docker logout | Out-Null
          '''
        }
      }
    }
  }
}
