# ReadMeLingo CLI

Command-line tool to translate GitHub repository documentation using Lingo.dev.

## Installation

The CLI is included in the ReadMeLingo project. Make sure you have the dependencies installed:

```bash
npm install
```

## Setup

Set your Lingo.dev API key as an environment variable:

```bash
export LINGODOTDEV_API_KEY=your_api_key_here
```

Or create a `.env` file:

```bash
LINGODOTDEV_API_KEY=your_api_key_here
```

## Usage

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

Specify target languages:

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

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-r, --repo <repo>` | GitHub repository URL or owner/repo (required) | - |
| `-t, --token <token>` | GitHub personal access token | - |
| `-l, --languages <languages>` | Comma-separated target languages | `es,fr,de` |
| `-o, --output <dir>` | Output directory for translated files | `./translations` |
| `--include-contributing` | Include CONTRIBUTING.md | `false` |
| `--include-docs` | Include /docs folder | `false` |
| `--no-pr` | Skip creating pull request | `false` |
| `--pr-title <title>` | Custom PR title | - |
| `--pr-body <body>` | Custom PR body | - |

## Examples

### Translate Next.js README

```bash
npm run cli translate -- --repo vercel/next.js --languages es,fr,de,pt
```

### Translate with all files

```bash
npm run cli translate -- \
  --repo owner/repo \
  --include-contributing \
  --include-docs \
  --languages es,fr,de,ja,zh-CN \
  --output ./output
```

### Translate private repo

```bash
npm run cli translate -- \
  --repo private-org/private-repo \
  --token ghp_your_token \
  --languages es,fr
```

## Output

Translated files are saved to the output directory (default: `./translations`) with the following structure:

```
translations/
├── README.es.md
├── README.fr.md
├── README.de.md
├── CONTRIBUTING.es.md (if included)
└── docs/
    └── guide.es.md (if included)
```

## Supported Languages

- `es` - Spanish
- `fr` - French
- `de` - German
- `pt` - Portuguese
- `ja` - Japanese
- `zh-CN` - Chinese (Simplified)
- `hi` - Hindi
- `ar` - Arabic
- `ru` - Russian
- `bn` - Bengali

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

## Integration with Web App

After running the CLI, you can:

1. **Upload translations to the web app** - Use the web app's preview feature to view and manage translations
2. **Create Pull Requests** - Use the web app to create PRs with translated files
3. **Download ZIP** - Use the web app to download all translations as a ZIP file

## Next Steps

1. Run the CLI to generate translations
2. Open the web app and upload/select the translated files
3. Preview, download, or create a PR with the translations

---

For more information, visit the main [README.md](./README.md)

