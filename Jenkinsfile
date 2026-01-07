pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Repository checked out successfully!'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh 'npm install'
            }
        }

        stage('Verify Project') {
            steps {
                echo 'Verifying project structure...'
                sh 'ls -la'
                sh 'echo "Main files present:"'
                sh 'ls *.html *.js package.json'
            }
        }

        stage('Success') {
            steps {
                echo 'Pipeline completed successfully!'
                echo 'Project is ready for deployment.'
            }
        }
    }

    post {
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
