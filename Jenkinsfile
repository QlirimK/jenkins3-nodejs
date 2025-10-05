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
            docker logout 2>$null | Out-Null

            $user  = "qlirimkastrati"
            $token = $env:DOCKER_PAT
            if ([string]::IsNullOrWhiteSpace($token)) { throw "DOCKER_PAT ist leer." }

            # Login via stdin + Exitcode hart prüfen
            $p = Start-Process -FilePath "docker" -ArgumentList @("login","-u",$user,"--password-stdin") `
                 -NoNewWindow -PassThru -RedirectStandardInput Pipe -Wait
            $p.StandardInput.WriteLine($token)
            $p.StandardInput.Close()
            if ($p.ExitCode -ne 0) { throw "docker login failed (ExitCode=$($p.ExitCode))" }

            docker push "${env:IMAGE_NAME}:${env:IMAGE_TAG}"
            if ($LASTEXITCODE -ne 0) { throw "docker push tag failed" }

            docker push "${env:IMAGE_NAME}:latest"
            if ($LASTEXITCODE -ne 0) { throw "docker push latest failed" }

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
