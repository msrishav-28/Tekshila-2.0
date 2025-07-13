# 🧠 Tekshila 2.0 - AI-Powered Code Documentation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/msrishav-28/Tekshila-2.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-v3.0+-green.svg)](https://flask.palletsprojects.com/)

Tekshila 2.0 is a modern, AI-powered code documentation platform that automatically generates comprehensive documentation, analyzes code quality, and integrates seamlessly with GitHub repositories. Built with a sleek glassmorphic UI and powered by Google's Gemini AI.

## ✨ Features

### 🔮 AI-Powered Documentation
- **Smart Code Analysis**: Automatically understands and documents code in 20+ programming languages
- **README Generation**: Creates professional, comprehensive README files for your projects
- **Multiple File Support**: Process individual files or entire project repositories
- **Custom Instructions**: Add specific documentation requirements and guidelines

### 🔍 Code Quality Analysis
- **Comprehensive Code Review**: AI-driven analysis of code quality, performance, and best practices
- **Security Assessment**: Identifies potential security vulnerabilities and issues
- **Performance Optimization**: Suggests improvements for better code performance
- **Detailed Reports**: Get actionable insights with explanations and recommendations

### 🐙 GitHub Integration
- **Repository Analysis**: Connect and analyze entire GitHub repositories
- **Automated Documentation**: Generate documentation directly for your GitHub projects
- **Branch Support**: Analyze specific branches or commits
- **Seamless Workflow**: Integrate documentation generation into your development workflow

### 🎨 Modern User Interface
- **Glassmorphic Design**: Beautiful, modern UI with glassmorphism effects
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations and transitions for better user experience

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+ (for frontend development)
- Google Gemini API key
- GitHub token (optional, for GitHub integration)

### 1. Clone the Repository
```bash
git clone https://github.com/msrishav-28/Tekshila-2.0.git
cd Tekshila-2.0
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
GITHUB_TOKEN=your_github_token_here  # Optional
```

### 5. Run the Application
```bash
# Start the backend API
python api/app.py

# In another terminal, start the frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access Tekshila 2.0!

## 🌐 Deployment

### Deploy to Vercel (Recommended)
Tekshila 2.0 is optimized for Vercel deployment with zero configuration:

1. **One-Click Deploy**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/msrishav-28/Tekshila-2.0)

2. **Manual Deploy**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Environment Variables**: Add your API keys in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `GEMINI_API_URL` 
   - `GITHUB_TOKEN` (optional)

For detailed deployment instructions, see [deploy.md](./deploy.md).

## 📖 Usage

### Generate Documentation
1. **Upload Files**: Drag and drop individual files or ZIP archives
2. **Choose Purpose**: Select README generation, API docs, or custom documentation
3. **Add Instructions**: Provide specific requirements or guidelines
4. **Generate**: Let AI create comprehensive documentation
5. **Download**: Get your generated documentation in markdown format

### Analyze Code Quality
1. **Upload Code**: Submit individual files or entire projects
2. **Run Analysis**: AI performs comprehensive code review
3. **Review Results**: Get detailed reports on quality, security, and performance
4. **Implement Suggestions**: Apply recommended improvements

### GitHub Integration
1. **Connect Repository**: Authenticate with your GitHub account
2. **Select Repository**: Choose from your repositories
3. **Analyze**: Generate documentation or analyze code quality
4. **Export**: Download results or create pull requests

## 🛠️ API Endpoints

### Core API Routes
- `GET /health` - Health check endpoint
- `POST /generate-docs` - Generate documentation from uploaded files
- `POST /analyze-quality` - Perform code quality analysis
- `POST /github/connect` - Connect GitHub repository
- `GET /github/repos` - List user repositories
- `POST /github/analyze` - Analyze GitHub repository

### Request Examples
```javascript
// Generate Documentation
fetch('/api/generate-docs', {
  method: 'POST',
  body: formData // Files and configuration
});

// Analyze Code Quality
fetch('/api/analyze-quality', {
  method: 'POST',
  body: formData // Code files
});
```

## 🏗️ Architecture

```
Tekshila-2.0/
├── api/                    # Flask backend
│   ├── app.py             # Main Flask application
│   ├── core.py            # Core AI processing logic
│   └── utils/             # Utility modules
│       ├── github_integration.py
│       └── code_quality.py
├── frontend/              # Modern web frontend
│   ├── index.html         # Main HTML file
│   ├── script.js          # JavaScript functionality
│   ├── styles.css         # Glassmorphic styling
│   └── package.json       # Frontend dependencies
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment config
└── deploy.md             # Detailed deployment guide
```

## 🔧 Configuration

### Supported File Types
Tekshila 2.0 supports 20+ programming languages:
- **Web**: HTML, CSS, JavaScript, TypeScript, React (JSX/TSX)
- **Backend**: Python, Java, C/C++, C#, Go, Rust, PHP, Ruby
- **Mobile**: Swift, Kotlin
- **Other**: Shell scripts, JSON, YAML, XML, Markdown, SQL

### Customization Options
- **Documentation Style**: Choose from various documentation templates
- **Analysis Depth**: Configure code analysis thoroughness
- **Output Format**: Markdown, HTML, or plain text
- **Custom Prompts**: Add specific instructions for AI processing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language processing
- **Lucide Icons** for beautiful iconography
- **Flask** for robust backend framework
- **Vercel** for seamless deployment platform

## 📞 Support

- **Documentation**: Check our [Wiki](https://github.com/msrishav-28/Tekshila-2.0/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/msrishav-28/Tekshila-2.0/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/msrishav-28/Tekshila-2.0/discussions)

---

<div align="center">
  <strong>Made with ❤️ by the Tekshila Team</strong>
  <br>
  <em>Empowering developers with AI-driven documentation</em>
</div>