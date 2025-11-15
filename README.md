# ReadMeLingo

Translate GitHub repository documentation into multiple languages using Lingo.dev SDK

ReadMeLingo is a CLI tool that translates repository documentation files using the Lingo.dev SDK. It uses efficient batch translation to translate multiple languages simultaneously, ensuring fast, reliable translations that work everywhere.

## Features

- ** Fast Batch Translation**: Uses Lingo.dev's `batchLocalizeText` API to translate to multiple languages in a single call per file
- ** 40+ Languages**: Support for 40+ languages including Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic, Hindi, and many more
- ** Flexible Output**: Save translations to any directory with organized file naming
- ** Works Everywhere**: Run on your machine, CI/CD, or anywhere Node.js runs
- ** Interactive Mode**: User-friendly prompts for easy configuration
- ** Batch Processing**: Translate multiple files including README, CONTRIBUTING, and docs folder
- ** Private Repo Support**: Works with private repositories using GitHub tokens

## Prerequisites

- **Node.js 18+** installed
- **Lingo.dev API key** (get one at [lingo.dev/auth](https://lingo.dev/auth))
- **(Optional) GitHub Personal Access Token** for private repositories

## Installation

### Option 1: Install from npm (Recommended)

```bash
npm install -g readmelingo
```

### Option 2: Install from Source

1. Clone the repository:

```bash
git clone https://github.com/yourusername/readmelingo.git
cd readmelingo
```

1. Install dependencies:

```bash
npm install
```

1. Build the CLI:

```bash
npm run cli:build
```

## Setup

### 1. Get Your Lingo.dev API Key

1. Visit [https://lingo.dev/auth](https://lingo.dev/auth)
2. Sign up or log in
3. Navigate to **Projects > Your Project > API Key**
4. Copy your API key (format: `api_...` or `lingo_...`)

### 2. Set Your API Key

**Option A: Environment Variable (Recommended for one-time use)**

```bash
export LINGODOTDEV_API_KEY=your_api_key_here
```

**Option B: .env File (Recommended for development)**

Create a `.env` file in your project root:

```bash
LINGODOTDEV_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here  # Optional, for private repos
```

**Option C: Persistent Setup (Recommended for regular use)**

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
echo 'export LINGODOTDEV_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc
```

### 3. (Optional) GitHub Token for Private Repositories

If you need to translate private repositories:

1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate a new token with `repo` scope
3. Set it as an environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

## Usage

### Quick Start

**If installed globally:**

```bash
readmelingo translate --repo owner/repo
```

**If using from source:**

```bash
npm run cli translate -- --repo owner/repo
```

This will:
- Fetch the README.md from the repository
- Translate it to Spanish, French, and German (default languages)
- Save translated files to `./translations/` directory

### Interactive Mode

Run without arguments to enter interactive mode:

```bash
readmelingo
# or
readmelingo translate
```

This will guide you through:
- Repository selection
- File selection (README, CONTRIBUTING, docs folder)
- Language selection
- Output directory configuration

### Basic Translation

Translate a repository's README to default languages (Spanish, French, German):

```bash
readmelingo translate --repo owner/repo
```

Or with full GitHub URL:

```bash
readmelingo translate --repo https://github.com/owner/repo
```

### Custom Languages

Specify target languages as a comma-separated list:

```bash
readmelingo translate --repo owner/repo --languages es,fr,de,pt,ja
```

**Supported language codes (40+ languages):**

**Most Popular:**
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ru` - Russian
- `ar` - Arabic
- `hi` - Hindi

**Additional European Languages:**
- `nl` - Dutch
- `pl` - Polish
- `tr` - Turkish
- `sv` - Swedish
- `no` - Norwegian
- `da` - Danish
- `fi` - Finnish
- `el` - Greek
- `cs` - Czech
- `ro` - Romanian
- `hu` - Hungarian
- `uk` - Ukrainian
- `ca` - Catalan
- `bg` - Bulgarian
- `hr` - Croatian
- `sk` - Slovak
- `sl` - Slovenian
- `lt` - Lithuanian
- `lv` - Latvian
- `et` - Estonian

**Asian & Other Languages:**
- `vi` - Vietnamese
- `th` - Thai
- `id` - Indonesian
- `he` - Hebrew
- `ms` - Malay
- `tl` - Filipino

*Note: Lingo.dev supports many more languages. You can use any valid ISO 639-1 language code. If a language isn't listed here, try using its standard language code.*

### Include Additional Files

Include CONTRIBUTING.md and /docs folder:

```bash
readmelingo translate --repo owner/repo --include-contributing --include-docs
```

### Custom Output Directory

Save translations to a specific directory:

```bash
readmelingo translate --repo owner/repo --output ./my-translations
```

### Private Repositories

Use a GitHub token for private repos:

```bash
readmelingo translate --repo owner/repo --token ghp_your_token_here
```

Or set as environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
readmelingo translate --repo owner/repo
```

### Command Options

| Option | Short | Description | Default | Required |
|--------|-------|-------------|---------|----------|
| `--repo <repo>` | `-r` | GitHub repository URL or `owner/repo` format | - | Yes* |
| `--token <token>` | `-t` | GitHub personal access token (for private repos) | `GITHUB_TOKEN` env var | No |
| `--languages <languages>` | `-l` | Comma-separated target language codes | `es,fr,de` | No |
| `--output <dir>` | `-o` | Output directory for translated files | `./translations` | No |
| `--include-contributing` | - | Include CONTRIBUTING.md file | `false` | No |
| `--include-docs` | - | Include entire /docs folder | `false` | No |

\* Required when not using interactive mode

### Usage Examples

**Example 1: Translate Next.js README to 4 languages**

```bash
readmelingo translate --repo vercel/next.js --languages es,fr,de,pt
```

**Example 2: Translate all files to multiple languages**

```bash
readmelingo translate \
  --repo owner/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh \
  --output ./output
```

**Example 3: Translate private repository**

```bash
readmelingo translate \
  --repo private-org/private-repo \
  --token ghp_your_token \
  --languages es,fr
```

**Example 4: Using from source (development)**

```bash
npm run cli translate -- --repo owner/repo --languages es,fr,de
```

### Output Structure

Translated files are saved to the output directory (default: `./translations`) with the following naming convention:

```
translations/
├── README.es.md          # Spanish translation
├── README.fr.md          # French translation
├── README.de.md          # German translation
├── CONTRIBUTING.es.md    # If --include-contributing is used
├── CONTRIBUTING.fr.md
└── ...
```

**File naming pattern:** `{original-filename}.{locale}.md`

For example:
- `README.md` → `README.es.md`, `README.fr.md`, etc.
- `CONTRIBUTING.md` → `CONTRIBUTING.es.md`, `CONTRIBUTING.fr.md`, etc.
- `docs/guide.md` → `guide.es.md`, `guide.fr.md`, etc.

## How It Works

ReadMeLingo uses Lingo.dev's efficient batch translation API:

1. **Fetches** markdown files from GitHub repository
2. **Validates** markdown content
3. **Translates** each file to all target languages using `batchLocalizeText` (one API call per file for all languages)
4. **Saves** translated files with locale suffix (e.g., `README.es.md`)

**Performance:** Instead of making N×M API calls (N files × M languages), we make only N calls by batching all languages per file. This results in 3-5x faster translation and reduced API usage.

## Supported Languages

ReadMeLingo supports **40+ languages** through Lingo.dev. Here are the most commonly used languages:

### Most Popular Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `es` | Spanish | Español |
| `fr` | French | Français |
| `de` | German | Deutsch |
| `it` | Italian | Italiano |
| `pt` | Portuguese | Português |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |
| `zh` | Chinese | 中文 |
| `ru` | Russian | Русский |
| `ar` | Arabic | العربية |
| `hi` | Hindi | हिन्दी |

### Additional European Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `nl` | Dutch | Nederlands |
| `pl` | Polish | Polski |
| `tr` | Turkish | Türkçe |
| `sv` | Swedish | Svenska |
| `no` | Norwegian | Norsk |
| `da` | Danish | Dansk |
| `fi` | Finnish | Suomi |
| `el` | Greek | Ελληνικά |
| `cs` | Czech | Čeština |
| `ro` | Romanian | Română |
| `hu` | Hungarian | Magyar |
| `uk` | Ukrainian | Українська |
| `ca` | Catalan | Català |
| `bg` | Bulgarian | Български |
| `hr` | Croatian | Hrvatski |
| `sk` | Slovak | Slovenčina |
| `sl` | Slovenian | Slovenščina |
| `lt` | Lithuanian | Lietuvių |
| `lv` | Latvian | Latviešu |
| `et` | Estonian | Eesti |

### Asian & Other Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `vi` | Vietnamese | Tiếng Việt |
| `th` | Thai | ไทย |
| `id` | Indonesian | Bahasa Indonesia |
| `he` | Hebrew | עברית |
| `ms` | Malay | Bahasa Melayu |
| `tl` | Filipino | Filipino |

**Note:** Lingo.dev supports many more languages beyond this list. You can use any valid ISO 639-1 language code. If your desired language isn't listed, try using its standard language code (e.g., `af` for Afrikaans, `sw` for Swahili, etc.).

## Troubleshooting

### "LINGODOTDEV_API_KEY not found" or "LINGODOTDEV_API_KEY environment variable is required"

**Solution:** Set your API key using one of these methods:

```bash
# Method 1: Environment variable (temporary)
export LINGODOTDEV_API_KEY=your_key_here

# Method 2: .env file (persistent for project)
echo "LINGODOTDEV_API_KEY=your_key_here" > .env

# Method 3: Shell profile (persistent system-wide)
echo 'export LINGODOTDEV_API_KEY=your_key_here' >> ~/.zshrc
source ~/.zshrc
```

**Verify your API key:**
- Format should be `api_...` or `lingo_...`
- Get it from [https://lingo.dev/auth](https://lingo.dev/auth) → Projects > API Key

### "Invalid LINGODOTDEV_API_KEY format"

**Solution:** Your API key must:
- Be at least 20 characters long
- Contain an underscore (`_`)
- Start with `api_` or `lingo_`

Check your API key at [https://lingo.dev/auth](https://lingo.dev/auth)

### "Invalid repository URL"

**Solution:** Use one of these formats:

```bash
# Short format
readmelingo translate --repo owner/repo

# Full URL format
readmelingo translate --repo https://github.com/owner/repo
```

### "Lingo.dev authentication failed"

**Possible causes:**
- Invalid or expired API key
- API key not properly set

**Solution:**
1. Visit [https://lingo.dev/auth](https://lingo.dev/auth)
2. Verify your API key in Projects > API Key
3. Regenerate if needed
4. Update your environment variable or `.env` file

### "Lingo.dev quota exceeded"

**Solution:**
- Upgrade your Lingo.dev plan at [https://lingo.dev](https://lingo.dev)
- Wait for your quota to reset
- Reduce the number of files or languages to translate

### "No markdown files found in repository"

**Solution:**
- Ensure the repository has a `README.md` file
- Use `--include-contributing` to include `CONTRIBUTING.md`
- Use `--include-docs` to include files from the `/docs` folder

### "Translation failed for [filename]"

**Possible causes:**
- Network issues
- API rate limiting
- Invalid markdown content

**Solution:**
- Check your internet connection
- Wait a few minutes and retry
- Verify the markdown file is valid
- Check Lingo.dev status page

### Translation takes too long

**Note:** Large files or many languages may take time. The tool uses efficient batching, but:
- Each file is translated to all languages in one batch
- Large markdown files (>10k words) may take 30-60 seconds
- Multiple files are processed sequentially

**Optimization tips:**
- Translate files individually if needed
- Reduce the number of target languages
- Use `--output` to save progress incrementally

## Architecture

### Technology Stack

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Translation Engine**: Lingo.dev SDK (`LingoDotDevEngine`)
- **Translation Method**: `batchLocalizeText` for efficient multi-language translation
- **GitHub Integration**: GitHub REST API
- **Interactive Prompts**: @clack/prompts
- **File System**: Node.js `fs/promises` for async file operations

### Key Implementation Details

1. **Batch Translation**: Uses `batchLocalizeText` to translate one file to multiple languages in a single API call
2. **Error Handling**: Comprehensive error handling for authentication, quota, and network issues
3. **Markdown Validation**: Validates markdown content before translation
4. **File Organization**: Saves translations with locale suffix (e.g., `README.es.md`)

### Performance

- **Before**: N files × M languages = N×M API calls
- **After**: N files × 1 call = N API calls (3-5x faster)

## Project Structure

```text
readmelingo/
├── cli/                      # CLI tool
│   ├── index.ts             # CLI entry point with Commander.js
│   └── commands/
│       └── translate.ts     # Translation command handler
├── lib/                     # Core utilities
│   ├── github.ts           # GitHub API integration
│   ├── lingo.ts            # Lingo.dev SDK integration (batchLocalizeText)
│   ├── markdown.ts         # Markdown parsing and validation
│   ├── utils.ts            # General utilities
│   └── zip.ts              # ZIP generation (if needed)
├── bin/                     # Executable script
│   └── readmelingo          # Global CLI entry point
├── dist/                    # Compiled JavaScript (for npm package)
└── translations/             # Default output directory
```

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- Lingo.dev API key for testing

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/readmelingo.git
cd readmelingo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # If exists, or create manually
# Add LINGODOTDEV_API_KEY=your_key_here to .env
```

### Running in Development

```bash
# Development mode (with tsx - no build needed)
npm run cli translate -- --repo owner/repo

# Build the CLI
npm run cli:build

# Run compiled version
npm run cli:run translate -- --repo owner/repo

# Test global installation locally
npm link
readmelingo translate --repo owner/repo
```

### Code Quality

The project uses:

- **TypeScript** for type safety
- **ESLint** for code linting (if configured)
- **Prettier** for code formatting (if configured)

### Key Files

- `lib/lingo.ts` - Core translation logic using `batchLocalizeText`
- `cli/commands/translate.ts` - Translation command handler
- `cli/index.ts` - CLI entry point and interactive mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## API Reference

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LINGODOTDEV_API_KEY` | Yes | Lingo.dev API key for translations | `api_1234567890abcdef` |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (for private repos) | `ghp_1234567890abcdef` |

### API Key Format

- Must start with `api_` or `lingo_`
- Must be at least 20 characters long
- Must contain an underscore

## Acknowledgments

- [Lingo.dev](https://lingo.dev) for the powerful translation API and SDK
- [Commander.js](https://github.com/tj/commander.js) for the CLI framework
- [@clack/prompts](https://github.com/natemoo-re/clack) for beautiful interactive prompts

## Contact

For questions or support, please open an issue on GitHub.
