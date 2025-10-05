pipeline {
  agent any

  environment {
    IMAGE_NAME = 'qlirimkastrati/jenkins3-nodejs'
  }

  stages {
    stage('Set TAG') {
      steps {
        script {
          // Kurzer Commit-Hash als Tag
          env.IMAGE_TAG = powershell(returnStdout: true, script: '(git rev-parse --short=7 HEAD).Trim()').trim()
        }
        echo "IMAGE_TAG = ${env.IMAGE_TAG}"
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
          // 1) Auth-Config schreiben (ersetzt docker login)
          powershell '''
            $cfgDir = "$env:WORKSPACE\\.docker-auth"
            New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null

            $user = $env:DOCKER_USER
            $pass = ($env:DOCKER_PASS -replace "`r|`n","").Trim()

            # base64(user:token)
            $auth = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("$user:$pass"))

            $json = @{ auths = @{ "https://index.docker.io/v1/" = @{ auth = $auth } } } |
                    ConvertTo-Json -Compress
            Set-Content -Path (Join-Path $cfgDir 'config.json') -Value $json -NoNewline
            Write-Host "Docker auth config written to $cfgDir"
          '''

          // 2) Pushen mit gesetztem DOCKER_CONFIG
          bat 'set DOCKER_CONFIG=%WORKSPACE%\\.docker-auth && docker push %IMAGE_NAME%:%IMAGE_TAG%'
          bat 'set DOCKER_CONFIG=%WORKSPACE%\\.docker-auth && docker push %IMAGE_NAME%:latest'
        }
      }
    }
  }

  post {
    always {
      // Aufräumen der temporären Auth-Datei
      bat 'rmdir /S /Q "%WORKSPACE%\\.docker-auth" 2>nul || exit 0'
      echo 'Pipeline finished.'
    }
  }
}
