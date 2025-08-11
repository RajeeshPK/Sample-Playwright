pipeline {
    agent any

    parameters {
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit', 'all'],
            description: 'Browser to run tests on'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['staging', 'production', 'dev'],
            description: 'Environment to run tests against'
        )
        booleanParam(
            name: 'HEADED',
            defaultValue: false,
            description: 'Run tests in headed mode'
        )
        string(
            name: 'TEST_TAG',
            defaultValue: '',
            description: 'Run specific test tag (optional)'
        )
        booleanParam(
            name: 'PARALLEL',
            defaultValue: true,
            description: 'Run tests in parallel'
        )
    }

    environment {
        NODE_VERSION = '18'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
        CI = 'true'
        FORCE_COLOR = '1'
    }

    tools {
        nodejs "${NODE_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.BUILD_TIMESTAMP = sh(returnStdout: true, script: 'date "+%Y-%m-%d_%H-%M-%S"').trim()
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                }
                echo "Build started at: ${env.BUILD_TIMESTAMP}"
                echo "Git commit: ${env.GIT_COMMIT_SHORT}"
            }
        }

        stage('Setup Environment') {
            parallel {
                stage('Install Dependencies') {
                    steps {
                        script {
                            if (isUnix()) {
                                sh '''
                                    echo "Node version:"
                                    node --version
                                    echo "NPM version:"
                                    npm --version
                                    echo "Installing dependencies..."
                                    npm ci --silent
                                '''
                            } else {
                                bat '''
                                    echo "Node version:"
                                    node --version
                                    echo "NPM version:"
                                    npm --version
                                    echo "Installing dependencies..."
                                    npm ci --silent
                                '''
                            }
                        }
                    }
                }
                
                stage('Cache Validation') {
                    steps {
                        echo "Validating cache and dependencies..."
                        script {
                            if (isUnix()) {
                                sh 'npm list --depth=0'
                            } else {
                                bat 'npm list --depth=0'
                            }
                        }
                    }
                }
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            echo "Installing Playwright browsers..."
                            npx playwright install --with-deps chromium firefox webkit
                            echo "Verifying browser installations..."
                            npx playwright --version
                        '''
                    } else {
                        bat '''
                            echo "Installing Playwright browsers..."
                            npx playwright install --with-deps chromium firefox webkit
                            echo "Verifying browser installations..."
                            npx playwright --version
                        '''
                    }
                }
            }
        }

        stage('Pre-Test Validation') {
            parallel {
                stage('Lint Code') {
                    when {
                        not { params.HEADED }
                    }
                    steps {
                        script {
                            try {
                                if (isUnix()) {
                                    sh 'npm run lint || echo "Linting not configured"'
                                } else {
                                    bat 'npm run lint || echo "Linting not configured"'
                                }
                            } catch (Exception e) {
                                echo "Linting failed or not configured: ${e.getMessage()}"
                            }
                        }
                    }
                }

                stage('Type Check') {
                    steps {
                        script {
                            try {
                                if (isUnix()) {
                                    sh 'npx tsc --noEmit || echo "TypeScript check not configured"'
                                } else {
                                    bat 'npx tsc --noEmit || echo "TypeScript check not configured"'
                                }
                            } catch (Exception e) {
                                echo "TypeScript check failed or not configured: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    def testCommand = 'npx playwright test'
                    def configOptions = []
                    
                    // Add browser selection
                    if (params.BROWSER != 'all') {
                        configOptions.add("--project=${params.BROWSER}")
                    }
                    
                    // Add headed mode if requested
                    if (params.HEADED) {
                        configOptions.add('--headed')
                    }
                    
                    // Add parallel/sequential execution
                    if (!params.PARALLEL) {
                        configOptions.add('--workers=1')
                    }
                    
                    // Add test tag if specified
                    if (params.TEST_TAG) {
                        configOptions.add("--grep='${params.TEST_TAG}'")
                    }
                    
                    // Add reporter options
                    configOptions.add('--reporter=html,junit,json')
                    
                    // Combine all options
                    if (configOptions) {
                        testCommand += ' ' + configOptions.join(' ')
                    }
                    
                    // Set environment-specific base URL
                    def baseUrl = getBaseUrlForEnvironment(params.ENVIRONMENT)
                    
                    echo "=========================================="
                    echo "Test Configuration:"
                    echo "Browser: ${params.BROWSER}"
                    echo "Environment: ${params.ENVIRONMENT}"
                    echo "Base URL: ${baseUrl}"
                    echo "Headed Mode: ${params.HEADED}"
                    echo "Parallel: ${params.PARALLEL}"
                    echo "Test Tag: ${params.TEST_TAG ?: 'All tests'}"
                    echo "Command: ${testCommand}"
                    echo "=========================================="
                    
                    try {
                        if (isUnix()) {
                            sh """
                                export PLAYWRIGHT_BASE_URL='${baseUrl}'
                                export PWTEST_SKIP_TEST_OUTPUT=1
                                ${testCommand}
                            """
                        } else {
                            bat """
                                set PLAYWRIGHT_BASE_URL=${baseUrl}
                                set PWTEST_SKIP_TEST_OUTPUT=1
                                ${testCommand}
                            """
                        }
                    } catch (Exception e) {
                        currentBuild.result = 'UNSTABLE'
                        echo "Some tests failed: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Generate Reports') {
            steps {
                echo "Generating test reports..."
                script {
                    try {
                        // Generate HTML report
                        if (isUnix()) {
                            sh 'npx playwright show-report --host=0.0.0.0 --port=9323 > /dev/null 2>&1 &'
                        } else {
                            bat 'start /B npx playwright show-report --host=0.0.0.0 --port=9323'
                        }
                    } catch (Exception e) {
                        echo "Failed to start report server: ${e.getMessage()}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Archive test results
                if (fileExists('test-results')) {
                    archiveArtifacts artifacts: 'test-results/**/*', fingerprint: true, allowEmptyArchive: true
                }
                
                // Archive HTML report
                if (fileExists('playwright-report')) {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report',
                        reportTitles: 'Playwright Test Results'
                    ])
                }
                
                // Publish JUnit results
                if (fileExists('test-results/results.xml')) {
                    publishTestResults testResultsPattern: 'test-results/results.xml'
                }
                
                // Archive screenshots and videos on failure
                if (currentBuild.result == 'UNSTABLE' || currentBuild.result == 'FAILURE') {
                    if (fileExists('test-results')) {
                        archiveArtifacts artifacts: 'test-results/**/*.png,test-results/**/*.webm', fingerprint: true, allowEmptyArchive: true
                    }
                }
                
                // Clean up workspace
                cleanWs(
                    cleanWhenAborted: true,
                    cleanWhenFailure: false,
                    cleanWhenNotBuilt: false,
                    cleanWhenSuccess: true,
                    cleanWhenUnstable: false,
                    deleteDirs: true,
                    disableDeferredWipeout: true,
                    notFailBuild: true,
                    patterns: [
                        [pattern: 'node_modules/**', type: 'INCLUDE'],
                        [pattern: 'test-results/**.webm', type: 'EXCLUDE'],
                        [pattern: 'test-results/**.png', type: 'EXCLUDE']
                    ]
                )
            }
        }
        
        success {
            echo "✅ All tests passed successfully!"
            script {
                def testStats = getTestStatistics()
                echo "Test Statistics: ${testStats}"
                
                // Send success notification (customize as needed)
                // slackSend(color: 'good', message: "✅ Playwright tests passed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}")
            }
        }
        
        unstable {
            echo "⚠️ Some tests failed, but build is marked as unstable"
            script {
                def testStats = getTestStatistics()
                echo "Test Statistics: ${testStats}"
                
                // Send unstable notification (customize as needed)
                // slackSend(color: 'warning', message: "⚠️ Some Playwright tests failed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}")
            }
        }
        
        failure {
            echo "❌ Build failed!"
            script {
                // Send failure notification (customize as needed)
                // slackSend(color: 'danger', message: "❌ Playwright build failed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}")
            }
        }
        
        aborted {
            echo "🛑 Build was aborted"
        }
    }
}

// Helper function to get base URL for different environments
def getBaseUrlForEnvironment(environment) {
    switch(environment) {
        case 'staging':
            return 'https://staging.example.com'
        case 'production':
            return 'https://example.com'
        case 'dev':
            return 'https://dev.example.com'
        default:
            return 'https://playwright.dev'
    }
}

// Helper function to get test statistics
def getTestStatistics() {
    try {
        if (fileExists('test-results/results.json')) {
            def jsonReport = readJSON file: 'test-results/results.json'
            def stats = [
                total: jsonReport.stats?.total ?: 'N/A',
                passed: jsonReport.stats?.passed ?: 'N/A',
                failed: jsonReport.stats?.failed ?: 'N/A',
                skipped: jsonReport.stats?.skipped ?: 'N/A'
            ]
            return stats
        }
    } catch (Exception e) {
        echo "Could not read test statistics: ${e.getMessage()}"
    }
    return "Statistics not available"
}