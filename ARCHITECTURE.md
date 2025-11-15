# ReadMeLingo Architecture

## Overview

ReadMeLingo uses a **SDK-based CLI architecture** where translations are done programmatically using the Lingo.dev SDK. The CLI tool is the primary interface for translation, while the web app (`readmelingoo-landing`) serves as a marketing landing page.

## Why This Architecture?

### Problems with Serverless Translation

1. **Timeout Limits**: Vercel functions have 10s (Hobby) or 60s (Pro) limits
2. **CLI Execution**: Running CLI tools in serverless is slow and unreliable
3. **Resource Constraints**: Serverless functions have limited resources
4. **Cold Starts**: First request can be very slow

### Benefits of SDK-Based

1. ✅ **No Timeout Limits**: Run as long as needed
2. ✅ **Faster Execution**: Direct SDK calls, no CLI process overhead
3. ✅ **Works Everywhere**: Run locally or on any server
4. ✅ **Better Error Handling**: Programmatic error handling and retries
5. ✅ **Cost Effective**: No serverless execution costs
6. ✅ **Reliable**: No process spawning or file system dependencies
7. ✅ **Type Safety**: TypeScript support with proper types

## Architecture Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                    User Workflow                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  Run CLI Tool                        │
        │  readmelingoo translate               │
        │  or npm run cli translate            │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  CLI Tool (cli/index.ts)            │
        │  - Interactive or command-line mode  │
        │  - Fetches GitHub files via API      │
        │  - Uses Lingo.dev SDK                │
        │  - Batch translation (40+ languages) │
        │  - Saves to ./translations/          │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Generated Files                    │
        │  - README.es.md                     │
        │  - README.fr.md                     │
        │  - README.de.md                     │
        │  - ... (one per language)           │
        └─────────────────────────────────────┘
```

## Components

### CLI Tool (`cli/`)

**Purpose**: Translate repository documentation files

**Features**:

- Interactive mode with user-friendly prompts
- Command-line mode with flags
- Fetches files from GitHub (README, CONTRIBUTING, /docs folder)
- Uses Lingo.dev SDK for batch translation
- Supports 40+ languages simultaneously
- Saves translated files to disk with organized naming
- No timeout limits
- Private repository support via GitHub tokens
- Progress indicators with inspirational quotes

**Dependencies**:

- `commander` - CLI argument parsing
- `inquirer` - Interactive prompts
- `ora` - Spinners and loading indicators
- `chalk` - Terminal styling
- `lingo.dev` - Lingo.dev SDK for translations
- Shared `lib/` utilities

**Entry Point**: `cli/index.ts` (compiled to `dist/cli/index.js`)

### Web App (`readmelingoo-landing/`)

**Purpose**: Marketing landing page

**Current State**: Static Next.js landing page showcasing the CLI tool

**Features**:

- Product information and features
- Installation instructions
- Links to npm and GitHub
- Responsive design with Tailwind CSS

**Dependencies**:

- Next.js 16 (App Router)
- Tailwind CSS 4
- shadcn/ui components (Button, Card)
- React 19

**Future Plans**: May include upload, preview, and PR creation features

### Shared Libraries (`lib/`)

**Purpose**: Reusable utilities for CLI and potential future web app features

**Modules**:

- `github.ts` - GitHub API helpers (fetch files, create PRs, branch management)
- `lingo.ts` - Lingo.dev SDK integration (batch translation, file saving)
- `markdown.ts` - Markdown utilities (validation, parsing, formatting)
- `zip.ts` - ZIP generation utilities (for future download features)
- `utils.ts` - General utility functions

## Data Flow

### Translation Flow

```text
User Input (Interactive or CLI flags)
    ↓
CLI Tool (cli/index.ts)
    ├─→ Parse repository URL
    ├─→ Prompt for languages (if not provided)
    └─→ Call translate command
            ↓
    translateRepo() (cli/commands/translate.ts)
        ├─→ Fetch README from GitHub API
        ├─→ Fetch CONTRIBUTING.md (if requested)
        ├─→ Fetch /docs folder recursively (if requested)
        └─→ Parse and validate markdown
            ↓
    translateFiles() (lib/lingo.ts)
        ├─→ Initialize Lingo.dev SDK engine
        ├─→ Batch translate each file to all target languages
        └─→ Handle errors (auth, quota, etc.)
            ↓
    saveTranslatedFiles() (lib/lingo.ts)
        ├─→ Create output directory
        ├─→ Generate filenames (README.es.md, README.fr.md, etc.)
        └─→ Write files to disk
            ↓
    Output: ./translations/ directory with translated files
```

### CLI Modes

1. **Interactive Mode** (default):
   - Prompts for repository URL
   - Checkbox selection for files (README, CONTRIBUTING, /docs)
   - Checkbox selection for target languages
   - Optional GitHub token input
   - Output directory selection

2. **Command-Line Mode**:
   - `readmelingoo translate -r owner/repo -l es,fr,de`
   - Flags: `--repo`, `--languages`, `--token`, `--output`, `--include-contributing`, `--include-docs`
   - Falls back to interactive prompts for missing required options

## File Structure

```text
readmelingoo/
├── cli/                          # CLI tool
│   ├── index.ts                  # Entry point (interactive & command modes)
│   ├── commands/
│   │   └── translate.ts          # Translation command implementation
│   └── utils/
│       └── quotes.ts              # Inspirational quotes for progress display
│
├── lib/                           # Shared utilities
│   ├── github.ts                 # GitHub API (fetch files, PR creation helpers)
│   ├── lingo.ts                  # Lingo.dev SDK integration
│   ├── markdown.ts               # Markdown parsing and validation
│   ├── zip.ts                    # ZIP generation utilities
│   └── utils.ts                  # General utility functions
│
├── readmelingoo-landing/          # Web app (landing page)
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── ui/                   # shadcn/ui components
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── lib/
│       └── utils.ts              # UI utility functions
│
├── translations/                  # Output directory (generated)
│   └── README.{locale}.md        # Translated files
│
├── dist/                          # Compiled JavaScript (build output)
│   └── cli/                      # Compiled CLI code
│
├── bin/                           # Binary symlink
│   └── readmelingoo               # CLI executable
│
├── package.json                   # Main package configuration
├── tsconfig.json                  # TypeScript config
└── tsconfig.cli.json              # CLI-specific TypeScript config
```

## Environment Variables

### CLI Tool

- `LINGODOTDEV_API_KEY` - **Required** for translations
  - Format: `api_...` or `lingo_...`
  - Can be set via `.env` file, environment variable, or shell profile
  - Get from: <https://lingo.dev/auth>
- `GITHUB_TOKEN` - **Optional**, for private repositories
  - Format: `ghp_...`, `gho_...`, `ghu_...`, `ghs_...`, or `ghr_...`
  - Required scope: `repo` (for private repos)
  - Can be provided via CLI flag `--token` or environment variable

### Web App

- Currently no environment variables required (static landing page)

## Deployment

### CLI Tool Deployment

- **Installation**: Available as npm package (`npm install -g readmelingoo`)
- **Usage**: Runs locally
- **No deployment needed**: Just install and run
- **Build**: TypeScript compiled to `dist/` directory
- **Binary**: Executable at `bin/readmelingoo` (symlinked to `dist/cli/index.js`)
- **Requirements**: Node.js 18+

### Web App Deployment

- **Current State**: Static Next.js landing page
- **Deployment**: Can be deployed to Vercel/Netlify/etc. (standard Next.js deployment)
- **No special requirements**: No API routes or serverless functions currently
- **Future**: If PR creation features are added, will require GitHub token configuration

## Benefits Summary

1. **Performance**: SDK is faster, no CLI process overhead
2. **Reliability**: No timeout issues, programmatic error handling
3. **Flexibility**: Run anywhere Node.js runs
4. **Cost**: No serverless execution costs for translation
5. **Scalability**: SDK can handle large files efficiently
6. **Developer Experience**: Type-safe SDK with clear API
7. **Maintainability**: No workspace management or file system complexity

## Future Enhancements

- [x] npm package for global installation
- [ ] CLI can create PRs directly (using existing `lib/github.ts` helpers)
- [ ] Batch processing multiple repositories
- [ ] Docker image for CLI
- [ ] Web app features (upload, preview, PR creation) - infrastructure ready in `lib/`
- [ ] Progress persistence and resume capability
- [ ] Translation caching to avoid re-translating unchanged content
- [ ] Support for additional file types (e.g., `.mdx`, `.txt`)

## Key Design Decisions

### Why CLI-First?

- **No server dependencies**: Users run translations on their own machines
- **No timeout issues**: Can handle large repositories without serverless limits
- **Cost effective**: No server costs for translation processing
- **Privacy**: Files never leave user's machine (except API calls to GitHub/Lingo.dev)

### Why SDK Over CLI Process?

- **Performance**: Direct API calls are faster than spawning processes
- **Error handling**: Better programmatic error handling and retries
- **Type safety**: Full TypeScript support with proper types
- **Reliability**: No file system or process management complexity

### Why Separate Landing Page?

- **Marketing**: Professional landing page for npm package discovery
- **Documentation**: Clear installation and usage instructions
- **Future-proof**: Infrastructure ready for web-based features if needed

---

This architecture ensures ReadMeLingo works reliably in all environments while maintaining a great developer experience.
