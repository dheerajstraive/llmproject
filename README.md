# CAPTCHA Solver API

An Express.js based API service that generates and processes interactive web applications with CAPTCHA functionality. This service integrates with GitHub and OpenAI to create dynamic, self-contained web projects.

## Features

- Express.js REST API endpoint
- GitHub repository automation
- OpenAI integration for code generation
- Automatic GitHub Pages deployment
- CAPTCHA generation and verification
- Secure API with shared secret authentication

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- GitHub account with appropriate permissions
- OpenAI API access

## Dependencies

```json
{
  "@octokit/rest": "^22.0.0",    // GitHub API client
  "axios": "^1.12.2",            // HTTP client for making API requests
  "body-parser": "^2.2.0",       // Parse incoming request bodies
  "dotenv": "^17.2.3",           // Environment variables management
  "express": "^5.1.0",           // Web application framework
  "openai": "^6.4.0"             // OpenAI API client
}
```

## Environment Variables

The following environment variables need to be set in a `.env` file:

```
SHARED_SECRET=your_shared_secret
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
LLMFOUNDRY_TOKEN=your_llm_token
PORT=8000 (optional, defaults to 8000)
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the required environment variables
4. Start the server:
   ```bash
   node index.js
   ```

## API Endpoints

### POST /api-endpoint

Processes requests to generate interactive web applications.

**Request Body:**
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

**Response:**
- 200: Request received successfully
- 403: Invalid secret
- 500: Internal server error

## Project Structure

- `index.js` - Main application file containing the Express server and API logic
- `package.json` - Project configuration and dependencies
- `.env` - Environment variables (not tracked in git)

## Features Explained

1. **API Authentication**: Uses a shared secret for endpoint security
2. **GitHub Integration**: 
   - Creates/updates repositories
   - Commits generated files
   - Enables GitHub Pages
3. **OpenAI Integration**:
   - Generates interactive web applications
   - Creates project documentation
4. **Error Handling**:
   - Retries for failed operations
   - Comprehensive error logging
5. **GitHub Pages**:
   - Automatic deployment
   - URL availability checking

## License

MIT License - See LICENSE file for details

## Contributing

This is an automated project generation system. For modifications, please update the source code directly.

## Support

For issues and support, please create a GitHub issue in the repository.