pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'   // nazwa instalacji Node.js skonfigurowanej w Jenkins (Global Tool Configuration)
    }

    environment {
        REGISTRY        = 'docker.io'
        IMAGE_NAME      = 'moja-organizacja/moja-aplikacja'
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        REGISTRY_CREDS  = 'dockerhub-credentials'   // ID poświadczeń w Jenkins Credentials
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push Docker image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", REGISTRY_CREDS) {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline zakończony sukcesem: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline zakończony błędem.'
        }
        always {
            sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
            cleanWs()
        }
    }
}
