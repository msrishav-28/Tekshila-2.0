// Application State Management
class AppState {
    constructor() {
        this.currentTab = 'documentation';
        this.githubConnected = false;
        this.githubToken = '';
        this.selectedRepo = '';
        this.selectedBranch = '';
        this.uploadedFiles = [];
        this.qualityFile = null;
        this.generatedContent = '';
        this.currentPurpose = 'readme';
        this.theme = localStorage.getItem('theme') || 'light';
    }

    updateState(key, value) {
        this[key] = value;
        this.notifyStateChange(key, value);
    }

    notifyStateChange(key, value) {
        // Emit custom event for state changes
        window.dispatchEvent(new CustomEvent('stateChange', {
            detail: { key, value }
        }));
    }
}

// API Configuration
const API_CONFIG = {
    baseUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : '/api',
    endpoints: {
        generateDocs: '/generate-docs',
        analyzeQuality: '/analyze-quality',
        connectGithub: '/github/connect',
        getRepos: '/github/repos',
        getBranches: '/github/branches',
        createPR: '/github/create-pr'
    }
};

// Utility Functions
class Utils {
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    static getFileIcon(filename) {
        const ext = Utils.getFileExtension(filename);
        const iconMap = {
            'py': 'fab fa-python',
            'js': 'fab fa-js-square',
            'jsx': 'fab fa-react',
            'ts': 'fab fa-js-square',
            'tsx': 'fab fa-react',
            'java': 'fab fa-java',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'php': 'fab fa-php',
            'rb': 'fas fa-gem',
            'go': 'fab fa-golang',
            'rs': 'fab fa-rust',
            'swift': 'fab fa-swift',
            'kt': 'fas fa-code',
            'zip': 'fas fa-file-archive',
            'c': 'fas fa-code',
            'cpp': 'fas fa-code',
            'cs': 'fas fa-code'
        };
        return iconMap[ext] || 'fas fa-file-code';
    }

    static showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type]}"></i>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    static showLoading(text = 'Processing...', subtext = 'Please wait while we analyze your code') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        const loadingSubtext = document.getElementById('loadingSubtext');
        
        loadingText.textContent = text;
        loadingSubtext.textContent = subtext;
        overlay.classList.add('active');
    }

    static hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Utils.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            Utils.showToast('Copied to clipboard!', 'success');
        }
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        this.setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Tab Manager
class TabManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.appState.updateState('currentTab', tabName);
    }
}

// File Upload Manager
class FileUploadManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        // Documentation file upload
        this.setupUploadZone('uploadZone', 'fileInput', false);
        
        // Quality analysis file upload
        this.setupUploadZone('qualityUploadZone', 'qualityFileInput', true);

        // Purpose radio buttons
        const purposeRadios = document.querySelectorAll('input[name="purpose"]');
        purposeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.appState.updateState('currentPurpose', e.target.value);
            });
        });
    }

    setupUploadZone(zoneId, inputId, isQuality) {
        const uploadZone = document.getElementById(zoneId);
        const fileInput = document.getElementById(inputId);

        // Click to upload
        uploadZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files, isQuality);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, isQuality);
        });
    }

    handleFiles(files, isQuality = false) {
        if (isQuality) {
            if (files.length > 0) {
                this.appState.updateState('qualityFile', files[0]);
                this.displayQualityFile(files[0]);
                document.getElementById('analyzeBtn').disabled = false;
            }
        } else {
            const newFiles = Array.from(files).filter(file => 
                !this.appState.uploadedFiles.find(f => f.name === file.name)
            );
            
            this.appState.uploadedFiles.push(...newFiles);
            this.displayUploadedFiles();
        }
    }

    displayUploadedFiles() {
        const container = document.getElementById('uploadedFiles');
        container.innerHTML = '';

        this.appState.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${Utils.getFileIcon(file.name)}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${Utils.formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="file-remove" onclick="fileUploadManager.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(fileItem);
        });
    }

    displayQualityFile(file) {
        const container = document.getElementById('qualityUploadedFiles');
        container.innerHTML = `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="${Utils.getFileIcon(file.name)}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${Utils.formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="file-remove" onclick="fileUploadManager.removeQualityFile()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    removeFile(index) {
        this.appState.uploadedFiles.splice(index, 1);
        this.displayUploadedFiles();
    }

    removeQualityFile() {
        this.appState.updateState('qualityFile', null);
        document.getElementById('qualityUploadedFiles').innerHTML = '';
        document.getElementById('analyzeBtn').disabled = true;
    }
}

// Documentation Manager
class DocumentationManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        const generateBtn = document.getElementById('generateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const copyBtn = document.getElementById('copyBtn');

        generateBtn.addEventListener('click', () => this.generateDocumentation());
        downloadBtn.addEventListener('click', () => this.downloadDocumentation());
        copyBtn.addEventListener('click', () => this.copyDocumentation());
    }

    async generateDocumentation() {
        if (this.appState.uploadedFiles.length === 0) {
            Utils.showToast('Please upload at least one file', 'error');
            return;
        }

        const projectName = document.getElementById('projectName').value;
        const customInstructions = document.getElementById('customInstructions').value;

        if (this.appState.currentPurpose === 'readme' && !projectName) {
            Utils.showToast('Please enter a project name for README generation', 'error');
            return;
        }

        Utils.showLoading('Generating documentation...', 'AI is analyzing your code and creating documentation');

        try {
            // Since we're connecting to Streamlit backend, we'll simulate the API call
            // In a real implementation, you'd need to create API endpoints in your Streamlit app
            // or use a separate Flask/FastAPI backend
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Mock response for demonstration
            const mockContent = this.generateMockContent(projectName, this.appState.currentPurpose);
            
            this.appState.updateState('generatedContent', mockContent);
            this.displayPreview(mockContent, this.appState.currentPurpose);
            
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('copyBtn').disabled = false;
            
            Utils.showToast('Documentation generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating documentation:', error);
            Utils.showToast('Failed to generate documentation. Please try again.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    generateMockContent(projectName, purpose) {
        if (purpose === 'readme') {
            return `# ${projectName}

## Overview
${projectName} is a modern application built with cutting-edge technologies. This project demonstrates best practices in software development and provides a solid foundation for scalable applications.

## Features
- 🚀 High performance and optimized code
- 📱 Responsive design for all devices
- 🔒 Security-first approach
- 🧪 Comprehensive testing suite
- 📚 Well-documented codebase

## Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/username/${projectName.toLowerCase()}.git

# Navigate to project directory
cd ${projectName.toLowerCase()}

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Usage
Detailed usage instructions and examples will be provided here.

## Contributing
We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.`;
        } else {
            return `// Enhanced code with AI-generated comments
// This file demonstrates best practices and includes detailed explanations

/**
 * Main application entry point
 * Initializes the application and sets up core functionality
 */
function initializeApp() {
    // Application initialization logic
    console.log('Application starting...');
    
    // Set up event listeners and core components
    setupEventListeners();
    initializeComponents();
    
    console.log('Application initialized successfully');
}

/**
 * Sets up global event listeners for the application
 * Handles user interactions and system events
 */
function setupEventListeners() {
    // Event listener setup code
    document.addEventListener('DOMContentLoaded', handleDOMReady);
    window.addEventListener('resize', handleWindowResize);
}

// Additional commented code would appear here...`;
        }
    }

    displayPreview(content, purpose) {
        const previewContainer = document.getElementById('previewContainer');
        
        if (purpose === 'readme') {
            previewContainer.innerHTML = `<div class="markdown-preview">${this.parseMarkdown(content)}</div>`;
        } else {
            previewContainer.innerHTML = `<div class="code-preview">${this.escapeHtml(content)}</div>`;
        }
    }

    parseMarkdown(markdown) {
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            .replace(/`([^`]*)`/gim, '<code>$1</code>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n/gim, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadDocumentation() {
        if (!this.appState.generatedContent) {
            Utils.showToast('No content to download', 'error');
            return;
        }

        const filename = this.appState.currentPurpose === 'readme' ? 'README.md' : 'commented_code.txt';
        const blob = new Blob([this.appState.generatedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Utils.showToast('File downloaded successfully!', 'success');
    }

    copyDocumentation() {
        if (!this.appState.generatedContent) {
            Utils.showToast('No content to copy', 'error');
            return;
        }

        Utils.copyToClipboard(this.appState.generatedContent);
    }
}

// GitHub Manager
class GitHubManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        // Check if user has stored GitHub token
        const storedToken = localStorage.getItem('github_token');
        const storedUser = localStorage.getItem('github_user');
        
        if (storedToken && storedUser) {
            this.appState.updateState('githubToken', storedToken);
            this.appState.updateState('githubConnected', true);
            this.appState.updateState('githubUser', JSON.parse(storedUser));
            this.updateConnectionStatus(true);
        }

        // Modal elements
        const authModal = document.getElementById('githubAuthModal');
        const skipAuthBtn = document.getElementById('skipAuthBtn');
        const continueAuthBtn = document.getElementById('continueAuthBtn');
        const authTokenInput = document.getElementById('authGithubToken');

        // Regular GitHub integration elements
        const connectBtn = document.getElementById('connectGithubBtn');
        const repoSelect = document.getElementById('repoSelect');
        const createPrBtn = document.getElementById('createPrBtn');

        // GitHub tab click handler
        const githubTab = document.querySelector('[data-tab="github"]');
        githubTab.addEventListener('click', () => {
            if (!this.appState.githubConnected) {
                setTimeout(() => this.showAuthModal(), 300);
            }
        });

        // Auth modal handlers
        skipAuthBtn.addEventListener('click', () => this.hideAuthModal());
        continueAuthBtn.addEventListener('click', () => this.authenticateWithToken());
        
        authTokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticateWithToken();
            }
        });

        // Regular handlers
        connectBtn.addEventListener('click', () => this.connectToGitHub());
        repoSelect.addEventListener('change', () => this.loadBranches());
        createPrBtn.addEventListener('click', () => this.createPullRequest());

        // Lock GitHub features if not authenticated
        this.updateFeatureLocks();
    }

    showAuthModal() {
        const modal = document.getElementById('githubAuthModal');
        modal.classList.add('active');
        document.getElementById('authGithubToken').focus();
    }

    hideAuthModal() {
        const modal = document.getElementById('githubAuthModal');
        modal.classList.remove('active');
    }

    updateFeatureLocks() {
        const githubPanel = document.querySelector('.github-panel');
        const prPanel = document.querySelector('.pr-panel');
        
        if (!this.appState.githubConnected) {
            githubPanel?.classList.add('github-feature-locked');
            prPanel?.classList.add('github-feature-locked');
            
            // Add click handlers to show auth modal
            [githubPanel, prPanel].forEach(panel => {
                panel?.addEventListener('click', (e) => {
                    if (panel.classList.contains('github-feature-locked')) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showAuthModal();
                    }
                });
            });
        } else {
            githubPanel?.classList.remove('github-feature-locked');
            prPanel?.classList.remove('github-feature-locked');
        }
    }

    async authenticateWithToken() {
        const token = document.getElementById('authGithubToken').value;
        
        if (!token) {
            Utils.showToast('Please enter a GitHub token', 'error');
            return;
        }

        Utils.showLoading('Authenticating...', 'Connecting to GitHub');

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.connectGithub}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store token and user info
                localStorage.setItem('github_token', token);
                localStorage.setItem('github_user', JSON.stringify(data.user));
                
                this.appState.updateState('githubConnected', true);
                this.appState.updateState('githubToken', token);
                this.appState.updateState('githubUser', data.user);
                
                this.updateConnectionStatus(true);
                this.updateFeatureLocks();
                this.hideAuthModal();
                
                // Pre-fill the token in the regular input
                document.getElementById('githubToken').value = token;
                
                await this.loadRepositories();
                
                Utils.showToast(`Welcome, ${data.user.name || data.user.login}!`, 'success');
            } else {
                Utils.showToast(data.error || 'Authentication failed', 'error');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            Utils.showToast('Failed to authenticate. Please check your token.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    async connectToGitHub() {
        const token = document.getElementById('githubToken').value || this.appState.githubToken;
        
        if (!token) {
            Utils.showToast('Please enter a GitHub token', 'error');
            return;
        }

        Utils.showLoading('Connecting to GitHub...', 'Validating your access token');

        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.connectGithub}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store token and user info
                localStorage.setItem('github_token', token);
                localStorage.setItem('github_user', JSON.stringify(data.user));
                
                this.appState.updateState('githubConnected', true);
                this.appState.updateState('githubToken', token);
                this.appState.updateState('githubUser', data.user);
                
                this.updateConnectionStatus(true);
                this.updateFeatureLocks();
                await this.loadRepositories();
                
                Utils.showToast('Successfully connected to GitHub!', 'success');
            } else {
                Utils.showToast(data.error || 'Failed to connect', 'error');
            }
        } catch (error) {
            console.error('GitHub connection error:', error);
            Utils.showToast('Failed to connect to GitHub. Please check your token.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('githubStatus');
        const githubRepos = document.getElementById('githubRepos');
        const prForm = document.getElementById('prForm');
        const prPlaceholder = document.getElementById('prPlaceholder');

        if (connected) {
            const user = this.appState.githubUser;
            statusElement.classList.add('connected');
            statusElement.innerHTML = `
                <div class="status-dot"></div>
                <span>${user ? user.login : 'Connected'}</span>
            `;
            githubRepos.style.display = 'block';
            
            if (this.appState.generatedContent) {
                prForm.style.display = 'block';
                prPlaceholder.style.display = 'none';
            }
        } else {
            statusElement.classList.remove('connected');
            statusElement.innerHTML = '<div class="status-dot"></div><span>Disconnected</span>';
            githubRepos.style.display = 'none';
            prForm.style.display = 'none';
            prPlaceholder.style.display = 'block';
        }
    }

    async loadRepositories() {
        try {
            // Mock repositories
            const repos = ['user/repo1', 'user/repo2', 'user/awesome-project'];
            const repoSelect = document.getElementById('repoSelect');
            
            repoSelect.innerHTML = '<option value="">Choose a repository...</option>';
            repos.forEach(repo => {
                const option = document.createElement('option');
                option.value = repo;
                option.textContent = repo;
                repoSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading repositories:', error);
            Utils.showToast('Failed to load repositories', 'error');
        }
    }

    async loadBranches() {
        const selectedRepo = document.getElementById('repoSelect').value;
        
        if (!selectedRepo) {
            return;
        }

        this.appState.updateState('selectedRepo', selectedRepo);

        try {
            // Mock branches
            const branches = ['main', 'develop', 'feature/new-feature'];
            const branchSelect = document.getElementById('branchSelect');
            
            branchSelect.innerHTML = '<option value="">Choose a branch...</option>';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch;
                option.textContent = branch;
                branchSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error loading branches:', error);
            Utils.showToast('Failed to load branches', 'error');
        }
    }

    async createPullRequest() {
        if (!this.appState.generatedContent) {
            Utils.showToast('Generate documentation first', 'error');
            return;
        }

        const selectedBranch = document.getElementById('branchSelect').value;
        const prTitle = document.getElementById('prTitle').value;
        const prDescription = document.getElementById('prDescription').value;
        const commitMessage = document.getElementById('commitMessage').value;

        if (!this.appState.selectedRepo || !selectedBranch) {
            Utils.showToast('Please select a repository and branch', 'error');
            return;
        }

        if (!prTitle || !commitMessage) {
            Utils.showToast('Please fill in PR title and commit message', 'error');
            return;
        }

        Utils.showLoading('Creating pull request...', 'Pushing changes and creating PR');

        try {
            // Simulate PR creation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const prUrl = `https://github.com/${this.appState.selectedRepo}/pull/123`;
            Utils.showToast(`Pull request created successfully! <a href="${prUrl}" target="_blank" style="color: var(--primary-color); text-decoration: underline;">View PR</a>`, 'success', 8000);

        } catch (error) {
            console.error('Error creating PR:', error);
            Utils.showToast('Failed to create pull request', 'error');
        } finally {
            Utils.hideLoading();
        }
    }
}

// Quality Analysis Manager
class QualityAnalysisManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        analyzeBtn.addEventListener('click', () => this.analyzeCode());
    }

    async analyzeCode() {
        if (!this.appState.qualityFile) {
            Utils.showToast('Please upload a file to analyze', 'error');
            return;
        }

        Utils.showLoading('Analyzing code quality...', 'AI is examining your code for issues and improvements');

        try {
            // Simulate analysis
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            const mockResults = this.generateMockAnalysis();
            this.displayResults(mockResults);
            
            Utils.showToast('Code analysis completed!', 'success');

        } catch (error) {
            console.error('Error analyzing code:', error);
            Utils.showToast('Failed to analyze code. Please try again.', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    generateMockAnalysis() {
        return {
            summary: "Your code shows good structure with room for improvement in error handling and documentation.",
            metrics: {
                "Code Quality": "B+",
                "Maintainability": "85%",
                "Security Score": "92%",
                "Performance": "Good",
                "Test Coverage": "78%",
                "Documentation": "65%"
            },
            issues: [
                {
                    line: 15,
                    message: "Consider adding error handling for this function call",
                    severity: "warning",
                    type: "error_handling"
                },
                {
                    line: 32,
                    message: "This variable name could be more descriptive",
                    severity: "info",
                    type: "naming"
                },
                {
                    line: 45,
                    message: "Potential security vulnerability: input validation needed",
                    severity: "error",
                    type: "security"
                }
            ],
            suggestions: [
                "Add comprehensive error handling throughout the codebase",
                "Improve variable and function naming for better readability",
                "Consider adding unit tests for critical functions",
                "Add JSDoc comments for better documentation"
            ]
        };
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        
        let html = '';

        // Display summary
        if (results.summary) {
            html += `
                <div class="quality-summary" style="margin-bottom: var(--spacing-xl); padding: var(--spacing-lg); background: var(--bg-secondary); border-radius: var(--radius-lg); border-left: 4px solid var(--primary-color);">
                    <h4 style="margin-bottom: var(--spacing-sm); color: var(--text-primary);">Summary</h4>
                    <p style="color: var(--text-secondary);">${results.summary}</p>
                </div>
            `;
        }

        // Display metrics
        if (results.metrics) {
            html += '<div class="quality-metrics">';
            Object.entries(results.metrics).forEach(([key, value]) => {
                html += `
                    <div class="metric-card">
                        <div class="metric-value">${value}</div>
                        <div class="metric-label">${key}</div>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Display issues
        if (results.issues && results.issues.length > 0) {
            html += '<div class="issues-section"><h4 style="margin-bottom: var(--spacing-lg); color: var(--text-primary);">Issues Found</h4>';
            results.issues.forEach(issue => {
                const severity = issue.severity ? issue.severity.toLowerCase() : 'info';
                html += `
                    <div class="issue-item ${severity}">
                        <div class="issue-severity ${severity}">${issue.severity || 'INFO'}</div>
                        <div class="issue-content">
                            <div class="issue-message">${issue.message || 'No description available'}</div>
                            <div class="issue-line">Line ${issue.line || 'N/A'} • ${issue.type || 'General'}</div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += `
                <div class="no-issues" style="text-align: center; padding: var(--spacing-2xl); color: var(--success-color);">
                    <h4 style="margin-bottom: var(--spacing-sm);">🎉 No issues found!</h4>
                    <p>Your code looks great!</p>
                </div>
            `;
        }

        // Display suggestions
        if (results.suggestions && results.suggestions.length > 0) {
            html += `
                <div class="suggestions-section" style="margin-top: var(--spacing-xl);">
                    <h4 style="margin-bottom: var(--spacing-lg); color: var(--text-primary);">Suggestions</h4>
                    <ul style="margin-left: var(--spacing-lg);">
            `;
            results.suggestions.forEach(suggestion => {
                html += `<li style="margin-bottom: var(--spacing-sm); color: var(--text-secondary);">${suggestion}</li>`;
            });
            html += '</ul></div>';
        }

        resultsContainer.innerHTML = html;
    }
}

// Professional Illustration System
class IllustrationSystem {
    static createSVGIllustration(type, size = 200) {
        const illustrations = {
            'empty-docs': `
                <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:0.2"/>
                            <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.1"/>
                        </linearGradient>
                    </defs>
                    <rect x="50" y="30" width="100" height="140" rx="8" fill="url(#docGrad)" stroke="#a78bfa" stroke-width="2" opacity="0.6"/>
                    <rect x="65" y="50" width="70" height="8" rx="4" fill="#ffd700" opacity="0.7"/>
                    <rect x="65" y="70" width="50" height="6" rx="3" fill="#e2e8f0" opacity="0.5"/>
                    <rect x="65" y="85" width="60" height="6" rx="3" fill="#e2e8f0" opacity="0.4"/>
                    <rect x="65" y="100" width="45" height="6" rx="3" fill="#e2e8f0" opacity="0.3"/>
                    <circle cx="125" cy="135" r="15" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6"/>
                    <path d="M120,135 L124,139 L130,130" stroke="#10b981" stroke-width="2" fill="none" opacity="0.8"/>
                </svg>
            `,
            'upload-ready': `
                <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="uploadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#2e1065;stop-opacity:0.1"/>
                            <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:0.1"/>
                        </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="70" fill="url(#uploadGrad)" opacity="0.8"/>
                    <path d="M100,60 L100,100 M85,75 L100,60 L115,75" stroke="#a78bfa" stroke-width="3" fill="none" opacity="0.8"/>
                    <rect x="70" y="110" width="60" height="30" rx="15" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.6"/>
                    <circle cx="85" cy="125" r="3" fill="#0ea5e9" opacity="0.7"/>
                    <circle cx="100" cy="125" r="3" fill="#10b981" opacity="0.7"/>
                    <circle cx="115" cy="125" r="3" fill="#ffd700" opacity="0.7"/>
                </svg>
            `,
            'analysis-chart': `
                <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.2"/>
                            <stop offset="100%" style="stop-color:#ffd700;stop-opacity:0.1"/>
                        </linearGradient>
                    </defs>
                    <rect x="40" y="140" width="15" height="30" fill="#a78bfa" opacity="0.6" rx="2"/>
                    <rect x="65" y="120" width="15" height="50" fill="#0ea5e9" opacity="0.7" rx="2"/>
                    <rect x="90" y="100" width="15" height="70" fill="#ffd700" opacity="0.8" rx="2"/>
                    <rect x="115" y="110" width="15" height="60" fill="#10b981" opacity="0.7" rx="2"/>
                    <rect x="140" y="90" width="15" height="80" fill="#2e1065" opacity="0.6" rx="2"/>
                    <circle cx="100" cy="50" r="25" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.5"/>
                    <path d="M100,25 A25,25 0 0,1 125,50" stroke="#0ea5e9" stroke-width="4" fill="none" opacity="0.7"/>
                    <path d="M125,50 A25,25 0 0,1 100,75" stroke="#ffd700" stroke-width="4" fill="none" opacity="0.8"/>
                </svg>
            `,
            'github-connected': `
                <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="githubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#2e1065;stop-opacity:0.1"/>
                            <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.1"/>
                        </linearGradient>
                    </defs>
                    <circle cx="70" cy="80" r="8" fill="#a78bfa" opacity="0.7"/>
                    <circle cx="130" cy="80" r="8" fill="#0ea5e9" opacity="0.7"/>
                    <circle cx="100" cy="120" r="8" fill="#ffd700" opacity="0.8"/>
                    <line x1="70" y1="80" x2="100" y2="120" stroke="#e2e8f0" stroke-width="2" opacity="0.6"/>
                    <line x1="130" y1="80" x2="100" y2="120" stroke="#e2e8f0" stroke-width="2" opacity="0.6"/>
                    <line x1="70" y1="80" x2="130" y2="80" stroke="#e2e8f0" stroke-width="2" opacity="0.4"/>
                    <rect x="60" y="40" width="80" height="15" rx="7" fill="#10b981" opacity="0.6"/>
                    <circle cx="100" cy="47" r="3" fill="#ffffff" opacity="0.9"/>
                </svg>
            `
        };
        
        return illustrations[type] || illustrations['empty-docs'];
    }
    
    static injectIllustration(elementId, type, size = 200) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = this.createSVGIllustration(type, size);
        }
    }
    
    static createFloatingElements() {
        const container = document.createElement('div');
        container.className = 'floating-elements';
        container.innerHTML = `
            <div class="floating-element" style="top: 10%; left: 10%; animation-delay: 0s;">
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="3" fill="#a78bfa" opacity="0.3"/>
                </svg>
            </div>
            <div class="floating-element" style="top: 20%; right: 15%; animation-delay: 1s;">
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="4" y="4" width="8" height="8" fill="#0ea5e9" opacity="0.2" rx="2"/>
                </svg>
            </div>
            <div class="floating-element" style="bottom: 20%; left: 20%; animation-delay: 2s;">
                <svg width="18" height="18" viewBox="0 0 18 18">
                    <polygon points="9,2 12,7 7,7" fill="#ffd700" opacity="0.4"/>
                </svg>
            </div>
            <div class="floating-element" style="bottom: 30%; right: 10%; animation-delay: 1.5s;">
                <svg width="14" height="14" viewBox="0 0 14 14">
                    <circle cx="7" cy="7" r="2" fill="#10b981" opacity="0.3"/>
                </svg>
            </div>
        `;
        
        // Add to hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.appendChild(container);
        }
    }
}

// Initialize professional illustrations
function initProfessionalAssets() {
    // Add floating elements to hero
    IllustrationSystem.createFloatingElements();
    
    // Enhanced placeholder content with better messaging
    const placeholders = document.querySelectorAll('.preview-placeholder, .results-placeholder, .pr-placeholder');
    placeholders.forEach(placeholder => {
        const icon = placeholder.querySelector('.placeholder-icon');
        if (icon) {
            // Replace text icons with SVG illustrations
            if (placeholder.classList.contains('preview-placeholder')) {
                icon.outerHTML = IllustrationSystem.createSVGIllustration('empty-docs', 80);
            } else if (placeholder.classList.contains('results-placeholder')) {
                icon.outerHTML = IllustrationSystem.createSVGIllustration('analysis-chart', 80);
            } else if (placeholder.classList.contains('pr-placeholder')) {
                icon.outerHTML = IllustrationSystem.createSVGIllustration('github-connected', 80);
            }
        }
    });
    
    // Enhanced upload zone
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        const uploadIcon = uploadZone.querySelector('.upload-icon');
        if (uploadIcon) {
            uploadIcon.innerHTML = IllustrationSystem.createSVGIllustration('upload-ready', 60);
        }
    }
}

// Application Initialization
class TekshilaApp {
    constructor() {
        this.appState = new AppState();
        this.init();
    }

    init() {
        // Initialize managers
        this.themeManager = new ThemeManager();
        this.tabManager = new TabManager(this.appState);
        this.fileUploadManager = new FileUploadManager(this.appState);
        this.documentationManager = new DocumentationManager(this.appState);
        this.githubManager = new GitHubManager(this.appState);
        this.qualityAnalysisManager = new QualityAnalysisManager(this.appState);

        // Set up global event listeners
        this.setupGlobalEventListeners();

        // Set default values
        this.setDefaultValues();

        console.log('Tekshila application initialized successfully!');
    }

    setupGlobalEventListeners() {
        // Listen for state changes
        window.addEventListener('stateChange', (e) => {
            const { key, value } = e.detail;
            this.handleStateChange(key, value);
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        // Focus search or upload
                        document.getElementById('fileInput').click();
                        break;
                    case 'Enter':
                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                            // Handle form submission
                            const generateBtn = document.getElementById('generateBtn');
                            if (!generateBtn.disabled) {
                                generateBtn.click();
                            }
                        }
                        break;
                }
            }
        });
    }

    handleStateChange(key, value) {
        switch (key) {
            case 'githubConnected':
                this.githubManager.updateConnectionStatus(value);
                break;
            case 'generatedContent':
                if (value && this.appState.githubConnected) {
                    document.getElementById('prForm').style.display = 'block';
                    document.getElementById('prPlaceholder').style.display = 'none';
                }
                break;
        }
    }

    setDefaultValues() {
        // Set default PR values
        document.getElementById('prTitle').value = 'docs: add AI-generated documentation';
        document.getElementById('prDescription').value = 'This PR adds comprehensive documentation generated by AI to improve code understanding and maintainability.';
        document.getElementById('commitMessage').value = 'docs: add AI-generated documentation';
    }
}

// Enhanced Professional Features
class ProfessionalUI {
    static initAdvancedFeatures() {
        this.initSmartLoading();
        this.initAdvancedToasts();
        this.initKeyboardShortcuts();
        this.initContextualHelp();
        this.initPerformanceMonitoring();
    }
    
    static initSmartLoading() {
        // Enhanced loading states for buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.disabled && !this.classList.contains('loading')) {
                    this.classList.add('loading');
                    
                    // Auto-remove loading state after reasonable time if not manually removed
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 10000);
                }
            });
        });
    }
    
    static initAdvancedToasts() {
        // Create enhanced toast system
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Enhanced toast methods
        window.showToast = (message, type = 'info', duration = 4000, actions = []) => {
            const container = document.querySelector('.toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const iconMap = {
                success: 'check-circle',
                error: 'x-circle',
                warning: 'alert-triangle',
                info: 'info'
            };
            
            toast.innerHTML = `
                <i data-lucide="${iconMap[type]}" class="toast-icon"></i>
                <div class="toast-content">
                    <div class="toast-message">${message}</div>
                    ${actions.length > 0 ? `<div class="toast-actions">${actions.map(action => 
                        `<button class="toast-action" onclick="${action.onClick}">${action.label}</button>`
                    ).join('')}</div>` : ''}
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i data-lucide="x"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            // Initialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Auto-remove
            if (duration > 0) {
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.classList.add('slide-out');
                        setTimeout(() => toast.remove(), 300);
                    }
                }, duration);
            }
            
            return toast;
        };
    }
    
    static initKeyboardShortcuts() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        // Save action
                        const saveBtn = document.getElementById('saveBtn');
                        if (saveBtn) {
                            saveBtn.click();
                        }
                        break;
                    case 'p':
                        e.preventDefault();
                        // Print action
                        const printBtn = document.getElementById('printBtn');
                        if (printBtn) {
                            printBtn.click();
                        }
                        break;
                }
            }
        });
    }
    
    static initContextualHelp() {
        // Contextual help tooltips
        const helpElements = document.querySelectorAll('[data-help]');
        helpElements.forEach(el => {
            el.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'help-tooltip';
                tooltip.innerHTML = this.dataset.help;
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.bottom + window.scrollY}px`;
            });
            
            el.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.help-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }
    
    static initPerformanceMonitoring() {
        // Monitor and log performance metrics
        const performanceLog = [];
        
        const logPerformance = (metric) => {
            performanceLog.push({
                metric,
                value: performance.getEntriesByName(metric)[0]?.duration || 0
            });
        };
        
        // Log page load performance
        window.addEventListener('load', () => {
            logPerformance('DOMContentLoaded');
            logPerformance('load');
        });
        
        // Log XHR and fetch performance
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            this.addEventListener('load', () => {
                logPerformance(`XHR: ${args[1]}`);
            });
            return originalXhrOpen.apply(this, args);
        };
        
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                logPerformance(`Fetch: ${args[0]}`);
                return response;
            });
        };
        
        // Periodically log performance metrics to console
        setInterval(() => {
            console.log('Performance Metrics:', performanceLog);
        }, 60000);
    }
}

// Complete the professional enhancement initialization
document.addEventListener('DOMContentLoaded', () => {
    app = new TekshilaApp();
    fileUploadManager = app.fileUploadManager;

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initialize all enhancements
    initScrollProgress();
    initThemeToggle();
    enhanceFileItemInteractions();
    addRippleAnimation();
    initProfessionalAssets();
    
    // Initialize professional UI features
    ProfessionalUI.initAdvancedFeatures();
    ProfessionalUI.enhanceFormValidation();
    
    // Staggered animation for initial load
    setTimeout(() => {
        const panels = document.querySelectorAll('.upload-panel, .preview-panel, .github-panel, .analysis-panel');
        AnimationUtils.staggeredFadeIn([...panels], 150);
    }, 500);
    
    console.log('🎨 Professional UI enhancements loaded successfully!');
});

// Global utility functions
window.ProfessionalUI = ProfessionalUI;
window.AnimationUtils = AnimationUtils;

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        TekshilaApp, 
        Utils, 
        ProfessionalUI, 
        AnimationUtils,
        IllustrationSystem 
    };
}