pipeline {
  agent any
  options {
    timestamps()
  }

  environment {
    DOCKER_USER = 'qlirimkastrati'
    DOCKER_REPO = 'qlirimkastrati/jenkins3-nodejs'
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
          // Nutze, wenn vorhanden, den Commit aus der SCM-Umgebung; sonst per Git abrufen
          def shortSha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : null
          if (!shortSha) {
            shortSha = powershell(returnStdout: true, script: '(git rev-parse --short=7 HEAD).Trim()').trim()
          }
          env.IMAGE_TAG = shortSha
          echo "IMAGE_TAG = ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        bat 'docker --version'
        bat 'docker build -t %DOCKER_REPO%:%IMAGE_TAG% -t %DOCKER_REPO%:latest .'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-pat', variable: 'DOCKER_PAT')]) {
          powershell '''
            $ErrorActionPreference = "Stop"
            $user = $env:DOCKER_USER
            if (-not $user) { $user = "qlirimkastrati" }
            $repo = $env:DOCKER_REPO
            $tag  = $env:IMAGE_TAG
            $tok  = $env:DOCKER_PAT

            if ([string]::IsNullOrWhiteSpace($tok)) { throw "DOCKER_PAT ist leer." }
            if ([string]::IsNullOrWhiteSpace($tag)) { throw "IMAGE_TAG ist leer." }

            # Kurzer, sicherer Debug (kein Secret im Klartext)
            $len = $tok.Length
            $shaHex = -join ([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($tok)) | ForEach-Object { $_.ToString("x2") })
            Write-Host ("Using Docker user: {0}" -f $user)
            Write-Host ("Token length = {0}" -f $len)
            Write-Host ("Token FP (sha256/8) = {0}" -f $shaHex.Substring(0,8))

            docker logout 2>$null | Out-Null
            $tok | docker login -u $user --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            docker push "$repo:$tag"
            if ($LASTEXITCODE -ne 0) { throw "docker push (tag) failed" }

            docker push "$repo:latest"
            if ($LASTEXITCODE -ne 0) { throw "docker push (latest) failed" }

            docker logout 2>$null | Out-Null
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
      // Logout auch im Fehlerfall versuchen (ohne Build zu failen)
      bat 'docker logout 1>nul 2>nul || exit 0'
    }
  }
}
