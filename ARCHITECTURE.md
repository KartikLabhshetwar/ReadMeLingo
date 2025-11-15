# ReadMeLingo Architecture

## Overview

ReadMeLingo uses a **SDK-based architecture** where translations are done programmatically using the Lingo.dev SDK, and the web app is used for preview, management, and PR creation.

## Why This Architecture?

### Problems with Serverless Translation

1. **Timeout Limits**: Vercel functions have 10s (Hobby) or 60s (Pro) limits
2. **CLI Execution**: Running CLI tools in serverless is slow and unreliable
3. **Resource Constraints**: Serverless functions have limited resources
4. **Cold Starts**: First request can be very slow

### Benefits of SDK-Based

1. ✅ **No Timeout Limits**: Run as long as needed
2. ✅ **Faster Execution**: Direct SDK calls, no CLI process overhead
3. ✅ **Works Everywhere**: Run locally, in CI/CD, or on any server
4. ✅ **Better Error Handling**: Programmatic error handling and retries
5. ✅ **Cost Effective**: No serverless execution costs
6. ✅ **Reliable**: No process spawning or file system dependencies
7. ✅ **Type Safety**: TypeScript support with proper types

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
        │  - Uses Lingo.dev SDK                │
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
- Uses Lingo.dev SDK for translation
- Saves translated files to disk
- No timeout limits
- Works in CI/CD

**Dependencies**:
- `commander` - CLI argument parsing
- `@clack/prompts` - Interactive prompts and spinners
- `lingo.dev` - Lingo.dev SDK for translations
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
- `lingo.ts` - Lingo.dev SDK integration
- `markdown.ts` - Markdown utilities
- `zip.ts` - ZIP generation

## Data Flow

### Translation Flow

1. **Translation Flow**:
   ```
   User → CLI → GitHub API → Fetch Files
                ↓
           Lingo.dev SDK → Translate
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
- Uses Lingo.dev SDK (no external CLI process)
- Just install dependencies and run

### Web App
- Deploy to Vercel/Netlify/etc.
- No special requirements
- No serverless timeout issues (translation done via SDK)

## Benefits Summary

1. **Performance**: SDK is faster, no CLI process overhead
2. **Reliability**: No timeout issues, programmatic error handling
3. **Flexibility**: Run anywhere Node.js runs
4. **Cost**: No serverless execution costs for translation
5. **Scalability**: SDK can handle large files efficiently
6. **Developer Experience**: Type-safe SDK with clear API
7. **Maintainability**: No workspace management or file system complexity

## Future Enhancements

- [ ] CLI can create PRs directly (skip web app)
- [ ] Batch processing multiple repos
- [ ] CI/CD integration examples
- [ ] Docker image for CLI
- [ ] npm package for global installation

---

This architecture ensures ReadMeLingo works reliably in all environments while maintaining a great user experience.

