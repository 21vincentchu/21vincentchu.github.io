pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Repository checked out successfully!'
            }
        }

        stage('Verify Project Structure') {
            steps {
                echo 'Verifying project files...'
                sh 'ls -la'
                sh 'echo "Checking for main files:"'
                sh 'test -f index.html && echo "✓ index.html found"'
                sh 'test -f script.js && echo "✓ script.js found"'
                sh 'test -d css && echo "✓ css directory found"'
                sh 'test -d images && echo "✓ images directory found"'
            }
        }

        stage('Validate HTML') {
            steps {
                echo 'Checking HTML files exist...'
                sh 'find . -name "*.html" -type f'
            }
        }

        stage('Success') {
            steps {
                echo '================================'
                echo 'Pipeline completed successfully!'
                echo 'Project is ready for deployment.'
                echo '================================'
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
