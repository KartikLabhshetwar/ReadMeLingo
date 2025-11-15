# ReadMeLingo

[![npm version](https://img.shields.io/npm/v/readmelingo.svg)](https://www.npmjs.com/package/readmelingo)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![GitHub](https://img.shields.io/github/stars/KartikLabhshetwar/ReadMeLingo?style=social)](https://github.com/KartikLabhshetwar/ReadMeLingo)

Translate GitHub repository documentation into 40+ languages using Lingo.dev. Fast batch translation CLI tool for README, CONTRIBUTING, and docs.

## Features

- **Fast Batch Translation** - Translate to multiple languages in a single API call per file (3-5x faster)
- **40+ Languages** - Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic, Hindi, and more
- **Interactive Mode** - User-friendly prompts for easy configuration
- **Flexible** - Works with public and private repositories, customizable output directories

## Installation

```bash
npm install -g readmelingo
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
readmelingo

# Or with options
readmelingo translate --repo owner/repo --languages es,fr,de
```

## Usage

### Basic Commands

```bash
# Translate README to default languages (es, fr, de)
readmelingo translate --repo owner/repo

# Specify languages
readmelingo translate --repo owner/repo --languages es,fr,de,pt,ja

# Include CONTRIBUTING.md and /docs folder
readmelingo translate --repo owner/repo --include-contributing --include-docs

# Custom output directory
readmelingo translate --repo owner/repo --output ./my-translations

# Private repository
readmelingo translate --repo owner/repo --token ghp_your_token
```

### Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--repo <repo>` | `-r` | GitHub repo URL or `owner/repo` | Required* |
| `--languages <langs>` | `-l` | Comma-separated language codes | `es,fr,de` |
| `--output <dir>` | `-o` | Output directory | `./translations` |
| `--include-contributing` | - | Include CONTRIBUTING.md | `false` |
| `--include-docs` | - | Include /docs folder | `false` |
| `--token <token>` | `-t` | GitHub token (or use `GITHUB_TOKEN` env) | - |

\* Not required in interactive mode

### Examples

```bash
# Translate Next.js README to 4 languages
readmelingo translate --repo vercel/next.js --languages es,fr,de,pt

# Translate all files to multiple languages
readmelingo translate \
  --repo owner/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh \
  --output ./output

# Private repository
readmelingo translate \
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

```
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

```bash
# Verify API key format: api_... or lingo_... (min 20 chars)
export LINGODOTDEV_API_KEY=your_key_here

# Get key from: https://lingo.dev/auth → Projects > API Key
```

### Invalid Repository URL

Use `owner/repo` or `https://github.com/owner/repo` format.

### Authentication Failed

- Verify API key at [lingo.dev/auth](https://lingo.dev/auth)
- Regenerate if expired
- Check environment variable is set correctly

### Quota Exceeded

- Upgrade plan at [lingo.dev](https://lingo.dev)
- Wait for quota reset
- Reduce files/languages

### No Files Found

- Ensure repository has `README.md`
- Use `--include-contributing` for CONTRIBUTING.md
- Use `--include-docs` for /docs folder

## How It Works

1. Fetches markdown files from GitHub
2. Validates markdown content
3. Translates each file to all target languages using `batchLocalizeText` (one API call per file)
4. Saves files with locale suffix

**Performance:** N files × 1 call = N API calls (vs N×M without batching)

## Development

```bash
# Clone and install
git clone https://github.com/KartikLabhshetwar/ReadMeLingo.git
cd ReadMeLingo
npm install

# Development mode
npm run cli translate -- --repo owner/repo

# Build
npm run cli:build

# Test locally
npm link
readmelingo translate --repo owner/repo
```

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
- [@clack/prompts](https://github.com/natemoo-re/clack) for interactive prompts

## Support

For questions or issues, please open an issue on [GitHub](https://github.com/KartikLabhshetwar/ReadMeLingo/issues).
