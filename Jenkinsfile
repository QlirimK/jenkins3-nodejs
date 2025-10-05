pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {
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
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-token',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          powershell '''
            docker logout 2>$null | Out-Null
            $user = $env:DOCKER_USER
            $pass = ($env:DOCKER_PASS -replace "`r|`n","")

            $pass | docker login -u $user --password-stdin
            if ($LASTEXITCODE -ne 0) {
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

  post {
    always { echo 'Pipeline finished.' }
  }
}
