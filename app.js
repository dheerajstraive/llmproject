require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const { OpenAI } = require('openai');

const app = express();
app.use(bodyParser.json());

// === Environment Variables ===
const SHARED_SECRET = process.env.SHARED_SECRET;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const LLMFOUNDRY_TOKEN = process.env.LLMFOUNDRY_TOKEN;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const openaiClient = new OpenAI({
  apiKey: `${LLMFOUNDRY_TOKEN}:my-test-project`,
  baseURL: "https://llmfoundry.straive.com/openai/v1/"
});

app.post('/api-endpoint', async (req, res) => {
  try {
    const data = req.body;
    if (data.secret !== SHARED_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    res.status(200).json({ message: "Request received" });
    processTask(data);
  } catch (err) {
    console.error('POST /api-endpoint error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

async function processTask(data) {
  const { brief, attachments = [], email, task, round, nonce, evaluation_url } = data;
  try {
    console.log('🧠 Prompting LLM to generate interactive project…');

    // === 💡 Improved Smart Prompt ===
    const userPrompt = `
You are a professional full-stack web developer.

Generate a **fully working, interactive web application** that satisfies the following brief:

${brief}

### Important Considerations
- The app must function correctly when opened locally (for example, by opening index.html in a browser).
- It should automatically include only the files necessary for a complete working app.
- If everything fits within one HTML file, use a single HTML file.
- If separate files (CSS, JS) make sense, include those as well.
- The app must visibly render all visual or dynamic elements, including any images like CAPTCHA.
- If the brief explicitly involves CAPTCHA functionality (e.g., generating, solving, or verifying one), then implement it realistically using a local <canvas> drawing or inline base64 image so it looks and behaves like a simple mock CAPTCHA. Otherwise, do **not** include any CAPTCHA features.
- The user should be able to see it, type its value, and verify it successfully, all offline.
- If the brief depends on external APIs or data, include **local mock or placeholder data** (e.g., sample JSON) so the app remains fully functional offline.
- Implement meaningful interactivity — buttons, forms, inputs, or dynamic visual feedback — so a user can engage with the app directly in the browser.

#### UI & UX Expectations
- Clean, responsive, and modern design.
- Clear typography and accessible color contrast.
- Proper spacing, alignment, and intuitive layout.
- Responsive behavior on desktop and mobile.

### Output & File Rules
- Do **not** include explanations, markdown fences (like \`\`\`html), summaries, markdown text, or any narrative text inside files.
- Do **not** include delimiters (e.g., \`=== index.html ===\`, \`==\`) or formatting markers inside file content.
- Do **not** prefix any file content (especially index.html) with extra characters such as \`==\`, comments, or formatting markers.
- Output **only the actual code** content that belongs to each file.
- The generated files should not contain any section like "### Explanation", "Notes", or similar.
- Do not include extra commentary outside of valid code syntax.
- All explanations, if any, should be provided separately (handled by another process, not in code).

**Requirements:**
- Must be fully self-contained (no API keys, no external URLs)
- Include working interactivity (forms, buttons, inputs, dynamic JS behavior)
- Must run completely offline by opening index.html
- Include all required assets inline or in the repo
- Use clean, semantic, and minimal code
- Output only complete files, using the format:

=== filename.ext ===
<complete file content>

(Only include files that are necessary)
    `.trim();

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userPrompt }],
    });

    const llmOutput = completion.choices[0].message.content;
    const files = parseFilesFromLLMOutput(llmOutput);

    if (files.length === 0) {
      console.warn("⚠️ No files parsed, using fallback index.html");
      files.push({
        path: 'index.html',
        content: `<html><body><pre>${escapeHtml(llmOutput)}</pre></body></html>`
      });
    }

    // === 📘 Generate README.md ===
    const readmePrompt = `
You are a documentation writer.
Write a clear, self-explanatory README.md for the project below.

Brief:
${brief}

Files:
${files.map(f => f.path).join(', ')}
    `.trim();

    const readmeCompletion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: readmePrompt }],
    });
    const readmeText = readmeCompletion.choices[0].message.content;
    files.push({ path: 'README.md', content: readmeText });

    const licenseText = `
MIT License

Copyright (c) ${(new Date()).getFullYear()} ${GITHUB_USERNAME}
    `.trim();
    files.push({ path: 'LICENSE', content: licenseText });

    // === 🧱 Create or Update GitHub Repo ===
    const repoName = `${task}-${nonce}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    console.log(`🚀 Checking for existing repo: ${repoName}`);

    let repo;
    try {
      // Try to get existing repo
      const { data } = await octokit.rest.repos.get({
        owner: GITHUB_USERNAME,
        repo: repoName,
      });
      repo = data;
      console.log('♻️ Repo exists — updating files...');
    } catch {
      // Repo not found — create new
      console.log('📦 Repo not found — creating new one...');
      const { data: newRepo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        private: false,
        description: `Auto-generated repo for ${task}`,
        homepage: `https://${GITHUB_USERNAME}.github.io/${repoName}/`,
        has_pages: true,
      });
      repo = newRepo;
    }

    // === 📂 Commit or Update Files ===
    for (const file of files) {
      const contentBase64 = Buffer.from(file.content).toString('base64');

      // Check if file exists
      let sha;
      try {
        const { data: existingFile } = await octokit.rest.repos.getContent({
          owner: GITHUB_USERNAME,
          repo: repoName,
          path: file.path,
        });
        sha = existingFile.sha;
        console.log(`📝 Updating existing file: ${file.path}`);
      } catch {
        console.log(`🆕 Creating new file: ${file.path}`);
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: GITHUB_USERNAME,
        repo: repoName,
        path: file.path,
        message: sha ? `Update ${file.path}` : `Add ${file.path}`,
        content: contentBase64,
        sha,
      });
    }

    // === 🌐 Enable GitHub Pages ===
    try {
      await octokit.request('POST /repos/{owner}/{repo}/pages', {
        owner: GITHUB_USERNAME,
        repo: repoName,
        source: { branch: 'main', path: '/' }
      });
      console.log('✅ GitHub Pages enabled.');
    } catch (err) {
      console.warn('⚠️ Pages activation fallback:', err.message);
    }

    const pagesUrl = `https://${GITHUB_USERNAME}.github.io/${repoName}/`;
    console.log(`🌍 GitHub Pages: ${pagesUrl}`);

    // Wait until GitHub Pages is live
    await waitFor200(pagesUrl, 60);

    // === 📤 Post Evaluation ===
    const commitResp = await octokit.rest.repos.listCommits({
      owner: GITHUB_USERNAME,
      repo: repoName,
      per_page: 1,
    });
    const commitSha = commitResp.data?.[0]?.sha || 'unknown';

    await postEvaluationResult({
      email,
      task,
      round,
      nonce,
      repo_url: `https://github.com/${GITHUB_USERNAME}/${repoName}`,
      commit_sha: commitSha,
      pages_url: pagesUrl,
      evaluation_url
    });

  } catch (err) {
    console.error('processTask error:', err);
  }
}

// === Helper Functions ===
function parseFilesFromLLMOutput(output) {
  const files = [];
  const regex = /^===\s*(.+?)\s*===\s*$/gm;
  let match;
  const positions = [];

  while ((match = regex.exec(output)) !== null) {
    positions.push({ idx: match.index, filename: match[1].trim(), fullMatch: match[0] });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].idx + positions[i].fullMatch.length;
    const end = (i + 1 < positions.length) ? positions[i + 1].idx : output.length;
    let content = output.slice(start, end).trim();

    // Remove any stray === or == from start of file
    content = content.replace(/^=+\s*/, '');

    files.push({ path: positions[i].filename, content });
  }

  return files;
}


function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function waitFor200(url, maxSeconds = 60) {
  for (let i = 0; i < maxSeconds / 5; i++) {
    try {
      const resp = await axios.get(url);
      if (resp.status === 200) {
        console.log(`✅ ${url} is reachable.`);
        return true;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 5000));
  }
  console.warn('⚠️ Timeout waiting for GitHub Pages to be ready.');
  return false;
}

async function postEvaluationResult({ email, task, round, nonce, repo_url, commit_sha, pages_url, evaluation_url }) {
  const body = { email, task, round, nonce, repo_url, commit_sha, pages_url };
  let attempt = 0, delay = 1000;
  while (attempt < 5) {
    try {
      const resp = await axios.post(evaluation_url, body, { headers: { 'Content-Type': 'application/json' } });
      if (resp.status === 200) {
        console.log('✅ Evaluation posted successfully.');
        return;
      }
    } catch (err) {
      console.error('Eval post error:', err.response?.data || err.message);
    }
    attempt++;
    console.log(`Retrying eval in ${delay / 1000}s...`);
    await new Promise(r => setTimeout(r, delay));
    delay *= 2;
  }
  console.error('❌ Failed to post evaluation after retries.');
}

// === Start Server ===
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
