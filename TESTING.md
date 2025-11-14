# Testing ReadMeLingo CLI Locally

## Quick Start

### Step 1: Build the CLI
```bash
npm run cli:build
```

### Step 2: Test the Interactive Mode

**Option A: Using the local bin file**
```bash
npm run cli:test
```

**Option B: Using the compiled dist file**
```bash
npm run cli:run
```

**Option C: Using tsx for development**
```bash
npm run cli
```

### Step 3: Set Your API Key
```bash
export LINGODOTDEV_API_KEY=your_api_key_here
```

## Interactive Flow

When you run the CLI without arguments, you'll see a beautiful interactive interface:

1. **Main Menu**: Select what you want to do
   - 📝 Translate Repository Documentation
   - ❌ Exit

2. **Repository Input**: Enter GitHub repo URL or owner/repo
   - Beautiful input box with validation
   - Accepts: `owner/repo` or `https://github.com/owner/repo`

3. **File Selection**: Choose which files to translate
   - 📄 README.md (always selected by default)
   - 📋 CONTRIBUTING.md
   - 📁 /docs folder

4. **Language Selection**: Multi-select with flags
   - 🇪🇸 Spanish (es)
   - 🇫🇷 French (fr)
   - 🇩🇪 German (de)
   - 🇮🇹 Italian (it)
   - 🇵🇹 Portuguese (pt)
   - 🇯🇵 Japanese (ja)
   - 🇰🇷 Korean (ko)
   - 🇨🇳 Chinese (zh)

5. **Output Directory**: Choose where to save translations
   - Default: `./translations`

6. **GitHub Token**: Optional for private repos
   - Can use `GITHUB_TOKEN` environment variable
   - Or enter interactively

## Command Line Options

You can also use command-line flags for automation:

```bash
npm run cli:run translate -- --repo owner/repo --languages es,fr,de
```

## Features

- ✨ Beautiful Clack UI with emojis and hints
- 🎯 Smart validation for repository URLs
- 📋 Multi-select for files and languages
- 🔒 Secure token input
- ⚡ Fast and responsive

## Troubleshooting

If you get "command not found":
1. Make sure you've run `npm run cli:build`
2. Check that `dist/cli/index.js` exists
3. Verify the shebang is present: `head -1 dist/cli/index.js`

If interactive mode doesn't work:
- Make sure you're running without the `translate` command
- Try: `npm run cli` (uses tsx for direct execution)

