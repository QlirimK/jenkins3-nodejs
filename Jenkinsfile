pipeline {
  agent any

  environment {
    // <--- dein Docker Hub Repo:
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {

    stage('Build Docker Image') {
      steps {
        script {
          // Commit-Hash (7 Zeichen) sauber holen – ohne Prompt/Zeilenumbrüche
          env.IMAGE_TAG = powershell(
            returnStdout: true,
            script: '(git rev-parse --short=7 HEAD).Trim()'
          ).trim()
        }
        echo "IMAGE_TAG = ${env.IMAGE_TAG}"

        // Image mit beiden Tags bauen
        bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-token',   // Jenkins-Credential (Username+Password)
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          powershell '''
            $ErrorActionPreference = "Stop"

            Write-Host ("Pushing as: {0}" -f $env:DOCKER_USER)

            if ([string]::IsNullOrWhiteSpace($env:DOCKER_PASS)) {
              throw "Empty DOCKER_PASS from Jenkins credentials 'dockerhub-token'."
            }

            # Login mit Access Token via stdin
            $env:DOCKER_PASS | docker login -u $env:DOCKER_USER --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            docker push "$env:IMAGE_NAME:$env:IMAGE_TAG"
            if ($LASTEXITCODE -ne 0) { throw "docker push (tag) failed" }

            docker push "$env:IMAGE_NAME:latest"
            if ($LASTEXITCODE -ne 0) { throw "docker push (latest) failed" }

            docker logout | Out-Null
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
