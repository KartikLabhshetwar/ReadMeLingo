# ReadMeLingo

Translate GitHub repository documentation into multiple languages using Lingo.dev SDK

ReadMeLingo is a CLI tool that translates repository documentation files using the Lingo.dev SDK, ensuring fast, reliable translations that work everywhere

## Features

- **Fast Translation**: Run locally with no timeout limits
- **8+ Languages**: Support for Spanish, French, German, Italian, Portuguese, Japanese, Korean, and Chinese
- **Flexible Output**: Save translations to any directory
- **Works Everywhere**: Run on your machine, CI/CD, or anywhere Node.js runs
- **Interactive Mode**: User-friendly prompts for easy configuration
- **Batch Processing**: Translate multiple files including README, CONTRIBUTING, and docs folder

## Prerequisites

- Node.js 18+ installed
- A Lingo.dev API key (get one at [lingo.dev](https://lingo.dev))
- (Optional) GitHub Personal Access Token for private repositories

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/readmelingo.git
cd readmelingo
```

2. Install dependencies:

```bash
npm install
```

3. Set your Lingo.dev API key:

```bash
export LINGODOTDEV_API_KEY=your_api_key_here
```

Or create a `.env` file:

```bash
LINGODOTDEV_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here  # Optional
```

## CLI Usage

### Quick Start

The fastest way to get started:

```bash
export LINGODOTDEV_API_KEY=your_api_key_here
npm run cli translate -- --repo owner/repo
```

Translated files will be saved to `./translations/` by default.

### Basic Translation

Translate a repository's README to default languages (Spanish, French, German):

```bash
npm run cli translate -- --repo owner/repo
```

Or with full URL:

```bash
npm run cli translate -- --repo https://github.com/owner/repo
```

### Custom Languages

Specify target languages as a comma-separated list:

```bash
npm run cli translate -- --repo owner/repo --languages es,fr,de,pt,ja
```

### Include Additional Files

Include CONTRIBUTING.md and /docs folder:

```bash
npm run cli translate -- --repo owner/repo --include-contributing --include-docs
```

### Custom Output Directory

Save translations to a specific directory:

```bash
npm run cli translate -- --repo owner/repo --output ./my-translations
```

### Private Repositories

Use a GitHub token for private repos:

```bash
npm run cli translate -- --repo owner/repo --token ghp_your_token_here
```

Or set as environment variable:

```bash
export GITHUB_TOKEN=ghp_your_token_here
npm run cli translate -- --repo owner/repo
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `-r, --repo <repo>` | GitHub repository URL or owner/repo (required) | - |
| `-t, --token <token>` | GitHub personal access token | - |
| `-l, --languages <languages>` | Comma-separated target languages | `es,fr,de` |
| `-o, --output <dir>` | Output directory for translated files | `./translations` |
| `--include-contributing` | Include CONTRIBUTING.md | `false` |
| `--include-docs` | Include /docs folder | `false` |

### CLI Examples

Translate Next.js README:

```bash
npm run cli translate -- --repo vercel/next.js --languages es,fr,de,pt
```

Translate with all files:

```bash
npm run cli translate -- \
  --repo owner/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh \
  --output ./output
```

Translate private repo:

```bash
npm run cli translate -- \
  --repo private-org/private-repo \
  --token ghp_your_token \
  --languages es,fr
```

### CLI Output Structure

Translated files are saved to the output directory (default: `./translations`) with the following structure:

```text
translations/
├── README.es.md
├── README.fr.md
├── README.de.md
├── CONTRIBUTING.es.md (if included)
└── docs/
    └── guide.es.md (if included)
```

## Installation as Global CLI

Install ReadMeLingo globally to use it from anywhere:

```bash
npm install -g readmelingo
```

Then use it directly:

```bash
readmelingo translate --repo owner/repo
```

## Supported Languages

- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINGODOTDEV_API_KEY` | Yes | Your Lingo.dev API key for translations |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (for private repos) |

## Troubleshooting

### "LINGODOTDEV_API_KEY not found"

Make sure you've set the environment variable:

```bash
export LINGODOTDEV_API_KEY=your_key_here
```

### "Invalid repository URL"

Use one of these formats:

- `owner/repo`
- `https://github.com/owner/repo`

### Translation timeout

Large files may take longer. The CLI has a 2-minute timeout. For very large repositories, consider translating files individually.

### No files found

Make sure the repository has a README.md file. Use `--include-contributing` and `--include-docs` to include additional files.

## Architecture

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Translation**: Lingo.dev SDK (programmatic API)
- **GitHub Integration**: GitHub REST API
- **Output**: Files saved to disk
- **Interactive Prompts**: @clack/prompts for user-friendly CLI experience

## Project Structure

```text
readmelingo/
├── cli/                  # CLI tool
│   ├── index.ts         # CLI entry point
│   └── commands/
│       └── translate.ts # Translation command
├── lib/                 # Utilities
│   ├── github.ts        # GitHub API helpers
│   ├── lingo.ts         # Lingo CLI integration
│   ├── markdown.ts      # Markdown utilities
│   ├── utils.ts         # General utilities
│   └── zip.ts           # ZIP generation
├── bin/                 # Executable script
│   └── readmelingo      # Global CLI entry point
└── dist/                # Compiled JavaScript (for npm package)
```

## Development

### Running the CLI

```bash
# Development (with tsx)
npm run cli translate -- --repo owner/repo

# Build and run
npm run cli:build
npm run cli:run translate -- --repo owner/repo

# Test global installation
npm run cli:test
```

### Code Quality

The project uses:

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Lingo.dev](https://lingo.dev) for the translation API
- [Commander.js](https://github.com/tj/commander.js) for CLI framework
- [@clack/prompts](https://github.com/natemoo-re/clack) for interactive prompts

## Contact

For questions or support, please open an issue on GitHub.
