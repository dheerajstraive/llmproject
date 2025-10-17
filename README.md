# 🚀 LLM Code Deployment System

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-v5.1.0-blue)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/openai-v6.4.0-orange)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An intelligent Express.js service that automatically builds, deploys, and updates web applications using LLM-assisted generation. The system handles the complete lifecycle from initial deployment to evaluation and revision, powered by OpenAI and GitHub automation.

<div align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/nodejs.svg" alt="Node.js" width="50"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/javascript.svg" alt="JavaScript" width="50"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/git.svg" alt="Git" width="50"/>
</div>

## ✨ Features

### 🏗️ Build Phase
- � **Request Verification** with secure authentication
- 🤖 **LLM-Assisted Generation** for dynamic web applications
- 🚀 **Automated Deployment** to GitHub Pages
- 📊 **Evaluation API Integration** for automated feedback

### 📋 Evaluation Phase
- 🔍 **Static Code Analysis**
- � **Dynamic Testing** with Playwright
- 🧠 **LLM-Based Code Review**
- � **Results Publishing**

### 🔄 Revision Phase
- 🛠️ **Intelligent Updates** based on feedback
- 🌐 **Automatic Re-deployment**
- 📝 **Metadata Management**
- 🔗 **Evaluation API Integration**

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

- 📦 **Node.js** (v14 or higher)
- 🔧 **npm** (Node Package Manager)
- 🐙 **GitHub** account with appropriate permissions
- 🔑 **OpenAI API** access

## 🛠️ Dependencies

<details>
<summary>Click to expand dependency list</summary>

| Package | Version | Description |
|---------|---------|-------------|
| @octokit/rest | ^22.0.0 | GitHub API client |
| axios | ^1.12.2 | HTTP client for API requests |
| body-parser | ^2.2.0 | Request body parser |
| dotenv | ^17.2.3 | Environment variables manager |
| express | ^5.1.0 | Web application framework |
| openai | ^6.4.0 | OpenAI API client |

</details>

## ⚙️ Environment Setup

Create a `.env` file in your project root:

```env
# API Configuration
SHARED_SECRET=your_shared_secret
PORT=8000 # optional, defaults to 8000

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username

# OpenAI Configuration
LLMFOUNDRY_TOKEN=your_llm_token
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd llmproject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node index.js
   ```

## 📡 API Documentation

### POST /api-endpoint

Generates and processes interactive web applications.

#### 📝 Request Format
```json
{
  "secret": "your_shared_secret",
  "brief": "project_description",
  "attachments": [],
  "email": "user_email",
  "task": "task_name",
  "round": "round_number",
  "nonce": "unique_identifier",
  "evaluation_url": "evaluation_endpoint"
}
```

#### 📤 Response Codes

| Status | Description |
|--------|-------------|
| 200 | ✅ Request received successfully |
| 403 | ❌ Invalid secret |
| 500 | ⚠️ Internal server error |

## 📁 Project Structure

```
llmproject/
├── 📄 index.js        # Main application file
├── 📄 package.json    # Project configuration
├── 📄 .env           # Environment variables (git-ignored)
├── 📄 .gitignore     # Git ignore configuration
└── 📄 README.md      # Project documentation
```

## 🔍 Key Features Explained

### 🔐 Security
- Robust API authentication using shared secrets
- Secure environment variable management
- Protected GitHub interactions

### 🤖 Automation
- Automated repository creation and management
- Dynamic file generation and commits
- Automatic GitHub Pages deployment

### 🔄 Integration
- Seamless OpenAI API integration
- GitHub API automation
- Webhook support for evaluation endpoints

### 🛠️ Error Handling
- Comprehensive error logging
- Automatic retries for failed operations
- Graceful fallback mechanisms

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 💬 Support

Having issues? Let us know!

- 📫 Create a GitHub issue
- 🔍 Check existing issues for solutions
- 📚 Consult the documentation

## 🌟 Star Us!

If you find this project helpful, please consider giving it a star ⭐️

---

<div align="center">
  <sub>Built with ❤️ by the CAPTCHA Solver API Team</sub>
</div>