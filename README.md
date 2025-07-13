# 🧠 Tekshila

Tekshila is an AI-powered web application that generates technical documentation and adds contextual comments to source code. It integrates with GitHub to create pull requests and performs AI-driven code quality analysis.

## 🚀 Features

- 📄 **README Generator**: Automatically generate detailed README files from your codebase
- 💬 **Code Commenting**: Add helpful and contextual comments to source code
- 🧪 **Code Quality Analysis**: Identify code smells, security issues, and performance bottlenecks
- 🔄 **GitHub Integration**: Create pull requests directly with your documentation
- 🧠 **AI-Powered**: Uses Gemini API for intelligent code analysis

## 📦 Project Structure

```
tekshila/
├── api/                      # Backend API
│   ├── app.py               # Flask API server
│   ├── core.py              # Document generation logic
│   └── utils/               # Utility modules
├── frontend/                # Web interface
│   ├── index.html          # Main HTML
│   ├── styles.css          # Styling
│   └── script.js           # Frontend logic
├── requirements.txt         # Python dependencies
├── vercel.json             # Vercel configuration
└── .env.example            # Environment template
```

## �️ Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tekshila.git
   cd tekshila
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run locally**:
   ```bash
   # Start the API server
   python api/app.py
   
   # In another terminal, serve the frontend
   cd frontend
   npx http-server . -p 3000
   ```

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `GEMINI_API_URL`

## 📃 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
