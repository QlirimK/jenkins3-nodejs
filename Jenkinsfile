pipeline {
  agent any

  options {
    skipDefaultCheckout(true)   // wir checken selbst aus
    timestamps()
  }

  environment {
    DOCKERHUB_USER = 'qlirimkastrati'
    IMAGE_NAME     = 'qlirimkastrati/jenkins3-nodejs'
    IMAGE_TAG      = '' // wird in "Set TAG" ermittelt
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
      // Immer im Workspace arbeiten
      dir(env.WORKSPACE) {
        // 1) HEAD versuchen
        def out = bat(returnStatus: true, returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()
        def sha = ''

        if (out && out =~ /[0-9a-fA-F]{7}/) {
          // letzte Zeile nehmen (Batch schreibt oft das Kommando mit raus)
          sha = out.readLines().last().trim()
        } else {
          // 2) Fallback: FETCH_HEAD (nach checkout vorhanden)
          def out2 = bat(returnStatus: true, returnStdout: true, script: 'git rev-parse --short=7 FETCH_HEAD').trim()
          if (out2 && out2 =~ /[0-9a-fA-F]{7}/) {
            sha = out2.readLines().last().trim()
          }
        }

        if (!sha) {
          error 'Konnte IMAGE_TAG nicht bestimmen (weder HEAD noch FETCH_HEAD verfügbar).'
        }

        env.IMAGE_TAG = sha
        echo "IMAGE_TAG = ${env.IMAGE_TAG}"
      }
    }
  }
}



    stage('Build Docker Image') {
      steps {
        bat 'docker --version'
        bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest .'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withCredentials([string(credentialsId: 'dockerhub-pat', variable: 'DOCKERHUB_TOKEN')]) {
          powershell '''
            $ErrorActionPreference = "Stop"

            $user = $env:DOCKERHUB_USER
            $token = $env:DOCKERHUB_TOKEN
            if ([string]::IsNullOrWhiteSpace($token)) { throw "Docker PAT (dockerhub-pat) ist leer." }
            $token = $token.Trim()

            # Mini-Diagnose ohne Geheimnisse zu leaken:
            Write-Host ("DockerHub User       = {0}" -f $user)
            Write-Host ("Token length         = {0}" -f $token.Length)
            $sha = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($token))).Replace("-","").Substring(0,8).ToLower()
            Write-Host ("Token FP (sha256/8)  = {0}" -f $sha)

            # Login via stdin (sicher)
            $token | docker login -u $user --password-stdin
            if ($LASTEXITCODE -ne 0) { throw "docker login failed" }

            docker push "$env:IMAGE_NAME:$env:IMAGE_TAG"
            if ($LASTEXITCODE -ne 0) { throw "push tag failed" }

            docker push "$env:IMAGE_NAME:latest"
            if ($LASTEXITCODE -ne 0) { throw "push latest failed" }

            docker logout | Out-Null
          '''
        }
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished.'
      // optionales Aufräumen, schadet nicht:
      // bat 'docker logout 2>nul || exit 0'
    }
  }
}
