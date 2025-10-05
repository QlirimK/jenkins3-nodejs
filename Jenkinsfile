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
        git branch: 'main', credentialsId: 'github-token',
            url: 'https://github.com/QlirimK/jenkins3-nodejs.git'
      }
    }

    stage('Set TAG') {
      steps {
        script {
          def out = bat(returnStdout: true, script: '@echo off\r\ngit rev-parse --short=7 HEAD').trim()
          def lines = out.readLines()
          def sha = lines ? lines[-1].trim() : ''
          if (!(sha ==~ /[0-9a-fA-F]{7}/)) {
            error 'Konnte IMAGE_TAG nicht bestimmen.'
          }
          env.IMAGE_TAG = sha.toLowerCase()
          echo "IMAGE_TAG = ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        bat "docker --version"
        bat "docker build -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} -t ${env.IMAGE_NAME}:latest ."
      }
    }

stage('Push to Docker Hub') {
  steps {
    withCredentials([string(credentialsId: 'dockerhub-pat', variable: 'DOCKER_PAT')]) {
      powershell '''
        $ErrorActionPreference = "Stop"
        $user = "qlirimkastrati"

        # --- Debug: Token-Länge + Fingerprint (ohne den Token anzuzeigen)
        $tok = $env:DOCKER_PAT
        if ([string]::IsNullOrWhiteSpace($tok)) { throw "DOCKER_PAT ist leer." }
        $len = $tok.Length
        $sha = [BitConverter]::ToString(
                 (New-Object Security.Cryptography.SHA256Managed)
                 .ComputeHash([Text.Encoding]::UTF8.GetBytes($tok))
               ).Replace("-","").Substring(0,8)
        Write-Host ("Using Docker user: {0}" -f $user)
        Write-Host ("Token length = {0}" -f $len)
        Write-Host ("Token FP (sha256/8) = {0}" -f $sha)

        # Sauberer Zustand
        docker logout 2>$null | Out-Null

        # Login per stdin (Best Practice)
        $tok | docker login -u $user --password-stdin
        if ($LASTEXITCODE -ne 0) {
          throw "docker login failed"
        }

        # Push beider Tags
        docker push "qlirimkastrati/jenkins3-nodejs:${env:IMAGE_TAG}"
        if ($LASTEXITCODE -ne 0) { throw "docker push (tag) failed" }

        docker push "qlirimkastrati/jenkins3-nodejs:latest"
        if ($LASTEXITCODE -ne 0) { throw "docker push (latest) failed" }

        docker logout 2>$null | Out-Null
      '''
    }
  }
}
  }

  post {
    always { echo 'Pipeline finished.' }
  }
}
