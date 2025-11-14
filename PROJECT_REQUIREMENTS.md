# 🚀 **Project Requirements Document**

## **Project Name: ReadMeLingo — Multilingual README & Docs Generator**

---

# 1. **Project Summary**

ReadMeLingo is a web-based tool that fetches a GitHub repository's documentation (`README.md`, `CONTRIBUTING.md`, `/docs/**/*.md`) and instantly converts them into multiple languages using **Lingo.dev**.

Users can preview translated Markdown, copy content, download ZIPs, and automatically open a Pull Request back to the repo.

The entire tool runs **inside a Next.js web app** — no external CLI required for users.

The server executes Lingo CLI internally.

---

# 2. **Core Objectives**

* Fetch README + other docs from any public GitHub repo
* Translate markdown using **Lingo.dev CLI in a backend temp workspace**
* Provide rendered markdown previews inside the UI
* Provide "Copy markdown", "Download ZIP", and "Create PR" actions
* Make the UX stupid-simple and fast
* Build it entirely with:
  * Next.js (App Router)
  * TypeScript
  * TailwindCSS + shadcn/ui
  * GitHub REST API
  * Lingo CLI (server-executed)

---

# 3. **Why This Project**

* README/docs in English block global contributors
* Developers never bother manually translating
* Existing translation tools don't generate PRs or work directly with repos
* Using Lingo.dev makes it seamless and automated
* This idea aligns perfectly with hackathon judging criteria:
  * **Impact** → helps open source maintainers instantly
  * **Creativity** → multilingual automation with PR generation
  * **Learning** → uses GitHub API + Lingo CLI + Next.js
  * **Technical quality** → real backend logic, not just a UI
  * **Great UX** → markdown preview, PR flow, file selection

---

# 4. **Detailed Features**

### ✔️ **Input**

* GitHub repo URL
* Optional: Personal Access Token (for private repos + PR creation)
* File selection:
  * `README.md` (auto-detected)
  * `CONTRIBUTING.md` (if available)
  * `/docs/**/*.md` (optional toggle)

### ✔️ **Translations**

* User picks target languages (default top 10)
* Server runs Lingo CLI in isolated workspace
* Produces `README.{lang}.md` and similar outputs

### ✔️ **Preview Mode**

* React-Markdown rendered preview
* A raw markdown tab
* Copy-to-clipboard button
* Download file
* Download ZIP for all languages

### ✔️ **Pull Request Flow**

* Server creates a new branch on repo (`readmelingo-translations/{timestamp}`)
* Upload translated files via GitHub contents API
* Open PR with title:
  **"Add multilingual documentation (powered by ReadMeLingo)"**
* PR body:
  * What languages were added
  * Tool attribution
  * Links to ReadMeLingo

---

# 5. **System Architecture**

```
                 ┌───────────────────────────┐
                 │         Frontend           │
                 │  Next.js + shadcn + TS     │
                 └───────────┬────────────────┘
                             │
                    (API Request)
                             │
                 ┌───────────▼────────────────┐
                 │      Backend API Routes     │
                 │   /fetch-readme             │
                 │   /translate                │
                 │   /create-pr                │
                 └───────────┬────────────────┘
                             │
                     Temp Workspace
                (Server-side Lingo CLI)
                             │
                 ┌───────────▼──────────────────┐
                 │       Lingo.dev CLI           │
                 │  Translation Pipeline          │
                 └───────────┬───────────────────┘
                             │
                        Translated Files
                             │
                       Sent to Frontend
                             │
                        Preview / PR
                             │
                 ┌───────────▼──────────────────┐
                 │         GitHub API            │
                 │  Fetch README | Commit | PR   │
                 └───────────────────────────────┘
```

---

# 6. **Technical Stack**

## Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Markdown Rendering**: react-markdown + remark-gfm
- **Icons**: lucide-react

## Backend
- **API Routes**: Next.js App Router API routes
- **GitHub Integration**: GitHub REST API (native fetch)
- **Translation**: Lingo.dev CLI (executed via child_process)
- **File Operations**: Node.js fs/promises
- **ZIP Generation**: jszip

## Infrastructure
- **Temp Workspace**: `/tmp/readmelingo-{uuid}`
- **Environment Variables**: LINGODOTDEV_API_KEY, GITHUB_TOKEN (optional)

---

# 7. **API Endpoints**

### POST `/api/fetch-readme`
Fetches repository documentation files.

**Request:**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "token": "optional_github_token",
  "includeContributing": true,
  "includeDocs": true
}
```

**Response:**
```json
{
  "success": true,
  "owner": "owner",
  "repo": "repo",
  "files": [
    {
      "name": "README.md",
      "path": "README.md",
      "content": "...",
      "size": 1234
    }
  ]
}
```

### POST `/api/translate`
Translates markdown files using Lingo.dev CLI.

**Request:**
```json
{
  "files": [
    {
      "path": "README.md",
      "content": "..."
    }
  ],
  "targetLocales": ["es", "fr", "de"],
  "sourceLocale": "en"
}
```

**Response:**
```json
{
  "success": true,
  "translatedFiles": [
    {
      "path": "README.es.md",
      "locale": "es",
      "content": "..."
    }
  ]
}
```

### POST `/api/create-pr`
Creates a pull request with translated files.

**Request:**
```json
{
  "owner": "owner",
  "repo": "repo",
  "translatedFiles": [...],
  "branchName": "readmelingo-translations-123",
  "prTitle": "Add multilingual documentation",
  "prBody": "...",
  "token": "github_token"
}
```

**Response:**
```json
{
  "success": true,
  "prUrl": "https://github.com/owner/repo/pull/123",
  "branch": "readmelingo-translations-123"
}
```

### POST `/api/download-zip`
Generates a ZIP file with all translations.

**Request:**
```json
{
  "files": [
    {
      "path": "README.md",
      "content": "..."
    }
  ],
  "filename": "translations.zip"
}
```

**Response:** Binary ZIP file download

---

# 8. **Environment Variables**

```bash
# Required
LINGODOTDEV_API_KEY=your_lingo_api_key_here

# Optional (for private repos and PR creation)
GITHUB_TOKEN=your_github_token_here
```

---

# 9. **Supported Languages**

- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Japanese (ja)
- Chinese Simplified (zh-CN)
- Hindi (hi)
- Arabic (ar)
- Russian (ru)
- Bengali (bn)

---

# 10. **Security Considerations**

- GitHub tokens are never logged or stored
- Tokens are only kept in memory during request processing
- All file paths are sanitized
- Temp workspaces have restricted permissions (700)
- CLI execution has timeout protection (60s)
- Input validation on all API endpoints

---

# 11. **Error Handling**

The application handles:
- Invalid repository URLs
- Private repos without tokens
- GitHub API rate limits
- Lingo CLI failures/timeouts
- File size limits
- Network errors
- Invalid API keys

---

# 12. **Performance**

- Translation typically completes in 1-4 seconds per file
- Concurrent file processing
- Automatic workspace cleanup
- Efficient ZIP generation
- Client-side caching of results

---

# 13. **Future Enhancements**

- Badge generator for README
- Translation history/caching
- Batch repository processing
- Custom language selection
- Translation quality metrics
- Integration with CI/CD pipelines

---

# 14. **Definition of Done**

✅ Can fetch README from any public GitHub repo  
✅ Can translate README into multiple languages  
✅ UI shows properly rendered previews  
✅ Copy & download works  
✅ PR creation works with PAT  
✅ Works on desktop & mobile  
✅ Lingo integration is verifiable  
✅ UX feels smooth and deterministic  

---

Generated with ❤️ by ReadMeLingo

