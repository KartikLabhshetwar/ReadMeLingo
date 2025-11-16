# ReadMeLingo

[![npm version](https://img.shields.io/npm/v/readmelingoo.svg)](https://www.npmjs.com/package/readmelingoo)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![GitHub](https://img.shields.io/github/stars/KartikLabhshetwar/ReadMeLingo?style=social)](https://github.com/KartikLabhshetwar/ReadMeLingo)

Translate GitHub repository documentation into 40+ languages using Lingo.dev. Fast batch translation CLI tool for README, CONTRIBUTING, and docs.

## Demo



https://github.com/user-attachments/assets/ad639c71-eb2a-48f2-ae67-6235dbe7292b



## Features

- **Fast Batch Translation** - Translate to multiple languages in a single API call per file (3-5x faster than sequential translation)
- **40+ Languages** - Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic, Hindi, and more
- **Interactive Mode** - User-friendly prompts for easy configuration (no flags needed)
- **Command-Line Mode** - Full CLI support with flags for automation and scripts
- **Flexible File Selection** - Translate README.md, CONTRIBUTING.md, or entire `/docs` folders
- **Private Repo Support** - Works with both public and private GitHub repositories
- **Smart Output** - Organized file naming with locale suffixes (e.g., `README.es.md`)

## Installation

```bash
npm install -g readmelingoo
```

## Quick Start

### 1. Get Your API Key

1. Visit [lingo.dev/auth](https://lingo.dev/auth)
2. Sign up and navigate to **Projects > Your Project > API Key**
3. Copy your API key

### 2. Set Your API Key

```bash
# Option 1: Environment variable (temporary)
export LINGODOTDEV_API_KEY=your_api_key_here

# Option 2: .env file (recommended)
echo "LINGODOTDEV_API_KEY=your_api_key_here" > .env

# Option 3: Persistent (add to ~/.zshrc or ~/.bashrc)
echo 'export LINGODOTDEV_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

### 3. Translate

```bash
# Interactive mode (recommended for first use)
readmelingoo

# Or with options
readmelingoo translate --repo owner/repo --languages es,fr,de
```

## Usage

### Basic Commands

```bash
# Interactive mode - prompts for all options
readmelingoo
# or
readmelingoo translate

# Command-line mode - specify all options as flags
readmelingoo translate --repo owner/repo --languages es,fr,de

# Include CONTRIBUTING.md and /docs folder
readmelingoo translate --repo owner/repo --languages es,fr,de --include-contributing --include-docs

# Custom output directory
readmelingoo translate --repo owner/repo --languages es,fr,de --output ./my-translations

# Private repository (use token flag or GITHUB_TOKEN env var)
readmelingoo translate --repo owner/repo --languages es,fr,de --token ghp_your_token
```

### Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--repo <repo>` | `-r` | GitHub repo URL or `owner/repo` format | Required* |
| `--languages <langs>` | `-l` | Comma-separated language codes (e.g., `es,fr,de`) | Prompts if not provided |
| `--output <dir>` | `-o` | Output directory for translated files | `./translations` |
| `--include-contributing` | - | Include CONTRIBUTING.md file | `false` |
| `--include-docs` | - | Include all `.md` files from `/docs` folder (recursive) | `false` |
| `--token <token>` | `-t` | GitHub personal access token for private repos | Uses `GITHUB_TOKEN` env var if set |

\* Not required in interactive mode - will prompt if missing

### Examples

```bash
# Translate Next.js README to 4 languages
readmelingoo translate --repo vercel/next.js --languages es,fr,de,pt

# Translate all files to multiple languages
readmelingoo translate \
  --repo owner/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh \
  --output ./output

# Private repository
readmelingoo translate \
  --repo private-org/private-repo \
  --token ghp_your_token \
  --languages es,fr
```

## Supported Languages

**Most Popular:** `es` (Spanish), `fr` (French), `de` (German), `it` (Italian), `pt` (Portuguese), `ja` (Japanese), `ko` (Korean), `zh` (Chinese), `ru` (Russian), `ar` (Arabic), `hi` (Hindi)

**European:** `nl` (Dutch), `pl` (Polish), `tr` (Turkish), `sv` (Swedish), `no` (Norwegian), `da` (Danish), `fi` (Finnish), `el` (Greek), `cs` (Czech), `ro` (Romanian), `hu` (Hungarian), `uk` (Ukrainian), `ca` (Catalan), `bg` (Bulgarian), `hr` (Croatian), `sk` (Slovak), `sl` (Slovenian), `lt` (Lithuanian), `lv` (Latvian), `et` (Estonian)

**Other:** `vi` (Vietnamese), `th` (Thai), `id` (Indonesian), `he` (Hebrew), `ms` (Malay), `tl` (Filipino)

*Lingo.dev supports many more languages. Use any valid ISO 639-1 language code.*

## Output Structure

Translated files are saved with locale suffix:

```text
translations/
├── README.es.md          # Spanish
├── README.fr.md          # French
├── README.de.md          # German
├── CONTRIBUTING.es.md    # If --include-contributing used
└── ...
```

**Pattern:** `{filename}.{locale}.md`

## Troubleshooting

### API Key Issues

**Error:** `LINGODOTDEV_API_KEY environment variable is required`

**Solution:**

```bash
# Verify API key format: api_... or lingo_... (minimum 20 characters)
export LINGODOTDEV_API_KEY=your_key_here

# Or create .env file in your project root:
echo "LINGODOTDEV_API_KEY=your_key_here" > .env

# Get your API key from: https://lingo.dev/auth → Projects > Your Project > API Key
```

### Invalid Repository URL

**Error:** `Invalid repository URL` or `Invalid repository format`

**Solution:**

- Use format: `owner/repo` (e.g., `vercel/next.js`)
- Or full URL: `https://github.com/owner/repo`
- Remove `.git` suffix if present

### Authentication Failed

**Error:** `Lingo.dev authentication failed` or `Invalid LINGODOTDEV_API_KEY format`

**Solution:**

1. Visit [lingo.dev/auth](https://lingo.dev/auth) and verify your API key
2. Regenerate API key if expired or invalid
3. Check environment variable is set correctly: `echo $LINGODOTDEV_API_KEY`
4. Ensure API key format starts with `api_` or `lingo_` and is at least 20 characters

### Quota Exceeded

**Error:** `Lingo.dev quota exceeded` or `Maximum` limit messages

**Solution:**

1. Visit [lingo.dev](https://lingo.dev) to upgrade your plan
2. Wait for your quota to reset (usually monthly)
3. Reduce the number of files or languages to translate
4. Check your current usage in the Lingo.dev dashboard

### No Files Found

**Error:** `No markdown files found in repository`

**Solution:**

- Ensure repository has `README.md` (always fetched by default)
- Use `--include-contributing` flag to include CONTRIBUTING.md
- Use `--include-docs` flag to include all `.md` files from `/docs` folder
- Verify repository is accessible (public or you have proper token for private repos)

### GitHub API Errors

**Error:** `GitHub API error: 404` or `Failed to fetch README`

**Solution:**

- Verify repository exists and is accessible
- For private repos, provide GitHub token via `--token` flag or `GITHUB_TOKEN` env var
- Check token has `repo` scope for private repositories
- Ensure repository URL format is correct

## How It Works

ReadMeLingo uses a **SDK-based architecture** for fast, reliable translations:

1. **Fetch Files** - Uses GitHub API to download markdown files (README.md, CONTRIBUTING.md, or `/docs` folder)
2. **Validate Content** - Parses and validates markdown to ensure proper formatting
3. **Batch Translation** - Uses Lingo.dev SDK's `batchLocalizeText` to translate each file to all target languages in a single API call
4. **Save Files** - Writes translated files to disk with locale suffixes (e.g., `README.es.md`, `README.fr.md`)

### Performance Benefits

- **Efficient**: N files × 1 API call per file = N total calls (instead of N×M calls without batching)
- **Fast**: Direct SDK calls, no CLI process overhead or timeout limits
- **Reliable**: Programmatic error handling with clear error messages
- **Scalable**: Can handle large repositories and multiple languages simultaneously

### Architecture

The tool runs entirely on your machine - no serverless functions or external services. Files are fetched from GitHub, translated via Lingo.dev API, and saved locally. This means:

- ✅ No timeout limits (unlike serverless functions)
- ✅ Works offline after fetching files
- ✅ Your content stays private (only sent to Lingo.dev for translation)
- ✅ No server costs or infrastructure needed

## Development

### Setup

```bash
# Clone and install dependencies
git clone https://github.com/KartikLabhshetwar/ReadMeLingo.git
cd ReadMeLingo
npm install
```

### Development Workflow

```bash
# Run CLI in development mode (uses tsx for TypeScript execution)
npm run cli translate -- --repo owner/repo

# Build TypeScript to JavaScript
npm run cli:build

# Test the built CLI locally
npm run cli:run translate -- --repo owner/repo

# Link package globally for local testing
npm link
readmelingoo translate --repo owner/repo
```

### Project Structure

```text
ReadMeLingo/
├── cli/                    # CLI tool source code
│   ├── index.ts            # Main entry point
│   ├── commands/           # Command implementations
│   └── utils/              # CLI utilities (quotes, etc.)
├── lib/                    # Shared libraries
│   ├── github.ts           # GitHub API integration
│   ├── lingo.ts            # Lingo.dev SDK integration
│   ├── markdown.ts         # Markdown utilities
│   └── utils.ts            # General utilities
├── dist/                   # Compiled JavaScript (build output)
├── bin/                    # CLI executable
└── web/                    # Landing page (Next.js app)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Contributing

Contributions welcome! Please open a Pull Request.

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and open PR

## License

GPL-3.0 - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Lingo.dev](https://lingo.dev) for the translation API
- [Commander.js](https://github.com/tj/commander.js) for CLI framework
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for interactive prompts

## Support

For questions or issues, please open an issue on [GitHub](https://github.com/KartikLabhshetwar/ReadMeLingo/issues).
