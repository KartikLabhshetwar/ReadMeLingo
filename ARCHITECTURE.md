# ReadMeLingo Architecture

## Overview

ReadMeLingo uses a **CLI-first architecture** where translations are done locally via CLI, and the web app is used for preview, management, and PR creation.

## Why This Architecture?

### Problems with Serverless Translation

1. **Timeout Limits**: Vercel functions have 10s (Hobby) or 60s (Pro) limits
2. **CLI Execution**: Running CLI tools in serverless is slow and unreliable
3. **Resource Constraints**: Serverless functions have limited resources
4. **Cold Starts**: First request can be very slow

### Benefits of CLI-First

1. ✅ **No Timeout Limits**: Run as long as needed
2. ✅ **Faster Execution**: Direct CLI execution, no network overhead
3. ✅ **Works Everywhere**: Run locally, in CI/CD, or on any server
4. ✅ **Better Error Handling**: Full control over the process
5. ✅ **Cost Effective**: No serverless execution costs
6. ✅ **Reliable**: No cold starts or resource limits

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Workflow                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  1. Run CLI Locally                 │
        │  npm run cli translate              │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  CLI Tool (cli/index.ts)            │
        │  - Fetches GitHub files              │
        │  - Runs Lingo.dev CLI                │
        │  - Saves to ./translations/          │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Generated Files                    │
        │  - README.es.md                     │
        │  - README.fr.md                     │
        │  - README.de.md                     │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  2. Upload to Web App               │
        │  - Click "Upload Translated Files"  │
        │  - Select all .md files             │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Web App (Next.js)                  │
        │  - Preview translations              │
        │  - Download ZIP                     │
        │  - Create PR                        │
        └─────────────────────────────────────┘
```

## Components

### CLI Tool (`cli/`)

**Purpose**: Translate repository documentation

**Features**:
- Fetches files from GitHub
- Runs Lingo.dev CLI locally
- Saves translated files to disk
- No timeout limits
- Works in CI/CD

**Dependencies**:
- `commander` - CLI argument parsing
- `chalk` - Colored output
- `ora` - Loading spinners
- Shared `lib/` utilities

### Web App (`app/`)

**Purpose**: Preview, manage, and create PRs with translations

**Features**:
- Upload translated files from CLI
- Preview rendered markdown
- Download as ZIP
- Create GitHub PRs
- Beautiful UI

**Dependencies**:
- Next.js 16 (App Router)
- shadcn/ui components
- react-markdown for preview
- GitHub API for PR creation

### Shared Libraries (`lib/`)

**Purpose**: Code shared between CLI and web app

**Modules**:
- `github.ts` - GitHub API helpers
- `lingo.ts` - Lingo.dev integration
- `markdown.ts` - Markdown utilities
- `zip.ts` - ZIP generation

## Data Flow

### Translation Flow

1. **CLI Execution**:
   ```
   User → CLI → GitHub API → Fetch Files
                ↓
           Lingo.dev CLI → Translate
                ↓
           Save to ./translations/
   ```

2. **Web App Upload**:
   ```
   User → Upload Files → /api/upload-translations
                ↓
           Parse & Store in Session
                ↓
           Preview Page → Display Translations
   ```

3. **PR Creation**:
   ```
   User → Create PR → /api/create-pr
                ↓
           GitHub API → Create Branch
                ↓
           Upload Files → Create PR
   ```

## File Structure

```
readmelingo/
├── cli/                    # CLI tool
│   ├── index.ts           # Entry point
│   └── commands/
│       └── translate.ts   # Translation command
│
├── app/                    # Web app
│   ├── api/               # API routes
│   │   ├── upload-translations/  # File upload
│   │   ├── create-pr/            # PR creation
│   │   └── download-zip/         # ZIP download
│   ├── preview/           # Preview page
│   └── page.tsx           # Landing page
│
├── lib/                    # Shared utilities
│   ├── github.ts          # GitHub API
│   ├── lingo.ts           # Lingo.dev
│   ├── markdown.ts        # Markdown utils
│   └── zip.ts             # ZIP utils
│
└── components/             # React components
    ├── ui/                # shadcn/ui
    ├── markdown-viewer.tsx
    └── translation-preview.tsx
```

## Environment Variables

### CLI Tool
- `LINGODOTDEV_API_KEY` - Required for translations
- `GITHUB_TOKEN` - Optional, for private repos

### Web App
- `GITHUB_TOKEN` - Optional, for PR creation

## Deployment

### CLI Tool
- Runs locally or in CI/CD
- No deployment needed
- Just install dependencies and run

### Web App
- Deploy to Vercel/Netlify/etc.
- No special requirements
- No serverless timeout issues (translation done via CLI)

## Benefits Summary

1. **Performance**: CLI is faster, no network latency
2. **Reliability**: No timeout issues
3. **Flexibility**: Run anywhere Node.js runs
4. **Cost**: No serverless execution costs for translation
5. **Scalability**: CLI can handle large files
6. **Developer Experience**: Clear separation of concerns

## Future Enhancements

- [ ] CLI can create PRs directly (skip web app)
- [ ] Batch processing multiple repos
- [ ] CI/CD integration examples
- [ ] Docker image for CLI
- [ ] npm package for global installation

---

This architecture ensures ReadMeLingo works reliably in all environments while maintaining a great user experience.

