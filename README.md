# 💡 Brainstorm Manager

A local-first personal brainstorm and subject decomposition manager designed to run anywhere, including static hosting on **GitHub Pages**, with optional cloud persistence via private **GitHub Gists**.

---

## ✨ Features

- **Subjects Dashboard**: Track multiple brainstorm subjects with visual progress rings, category breakdowns, and completion percentages.
- **Decomposed Concept Board**:
  - Break down each subject into **Categories** (e.g. 5–10 categories) and **Aspects** (e.g. 50+ total aspects).
  - 1-Click Status Toggling: `⚪ Not Started` ➔ `🟡 In Progress` ➔ `🟢 Done`.
  - Dynamic Progress: Real-time progress updates across aspects, categories, and the whole subject.
  - Markdown Notes per Aspect: Capture research thoughts, pros/cons, solutions, and reference links.
  - Quick inline creation: Add categories and aspects rapidly with the Enter key.
- **AI Decomposition Import**:
  - Built-in **"Copy AI Prompt"** helper formatted for ChatGPT, Claude, and Gemini.
  - Import subjects from **local `.json` or `.md` files**, or directly paste text.
  - Live preview modal showing detected categories and aspect count before importing.
- **Multi-Tier Persistence**:
  - **Local-First (`localStorage`)**: Works instantly offline out-of-the-box.
  - **GitHub Gist Sync**: Connect a GitHub Personal Access Token to sync and backup your data across devices in a private Gist.
  - **Backup & Restore**: One-click full workspace backup (`.json`) download and restore.
  - **Per-Subject Export**: Export any individual subject as a portable JSON file.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+) and npm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/brainstorm-manager.git
cd brainstorm-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to GitHub Pages

This app is pre-configured with relative asset paths (`base: './'`) and an automated GitHub Actions deployment workflow:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Brainstorm Manager"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Every push to `main` will automatically build and publish the app!

---

## 🤖 Using AI to Decompose Subjects

You can use the built-in **"Import AI Subject"** button or copy this prompt into Gemini, Claude, or ChatGPT:

```text
Please act as a domain expert and brainstorming strategist. 
Decompose the subject "[INSERT SUBJECT HERE]" into 5 to 10 logical categories, each containing 5 to 10 granular, insightful aspects or study topics to research and brainstorm.

Output ONLY valid JSON matching this schema:
{
  "title": "[Subject Name]",
  "description": "[Brief 1-2 sentence description]",
  "categories": [
    {
      "name": "[Category Name]",
      "aspects": [
        "[Aspect 1: specific question or sub-topic]",
        "[Aspect 2: specific question or sub-topic]"
      ]
    }
  ]
}
```

Then simply paste the JSON into the **Import AI Subject** modal, or save it as a file and upload it. The app also supports hierarchical Markdown format (`# Title`, `## Category`, `- Aspect`).

---

## 🔒 GitHub Gist Cloud Sync Setup

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=gist&description=Brainstorm+Manager+Sync).
2. Generate a Personal Access Token with the `gist` scope.
3. In the Brainstorm Manager header, click **Gist Backup**.
4. Paste your token and click **Create New Gist**.
5. Enable **Automatic Sync** if you want your changes to push to GitHub automatically as you brainstorm.
