# ReadMeLingo CLI - Quick Start

## 🚀 Get Started in 2 Minutes

### Step 1: Set Your API Key

```bash
export LINGODOTDEV_API_KEY=your_api_key_here
```

### Step 2: Run the CLI

```bash
npm run cli translate -- --repo vercel/next.js
```

That's it! Translated files will be saved to `./translations/`

## 📋 Common Commands

### Basic Usage

```bash
# Translate README to Spanish, French, German
npm run cli translate -- --repo owner/repo

# Custom languages
npm run cli translate -- --repo owner/repo --languages es,fr,de,pt,ja

# Include CONTRIBUTING.md and /docs
npm run cli translate -- --repo owner/repo --include-contributing --include-docs

# Custom output directory
npm run cli translate -- --repo owner/repo --output ./my-translations

# Private repository
npm run cli translate -- --repo private-org/repo --token ghp_your_token
```

## 🔄 Workflow

1. **Run CLI locally** to generate translations
2. **Upload files to web app** for preview
3. **Create PR** or download ZIP from web app

## 📁 Output Structure

```
translations/
├── README.es.md
├── README.fr.md
├── README.de.md
└── ...
```

## 🌐 Next Steps

After generating translations:

1. Open the web app: `npm run dev`
2. Click "Upload Translated Files"
3. Select all `.md` files from `./translations/`
4. Preview, download, or create a PR!

---

For detailed documentation, see [CLI_README.md](./CLI_README.md)

