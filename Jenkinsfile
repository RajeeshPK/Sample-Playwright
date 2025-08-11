pipeline {
    agent {
        docker {
            image 'node:20' // Use official Node.js Docker image
            args '-u root:root' // Run as root so npm can install globally if needed
        }
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Playwright tests') {
            steps {
                sh 'npx playwright install --with-deps'
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            junit 'playwright-report/*.xml' // if using JUnit reporter
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }
    }
}
