# ReadMeLingo 🌍

> Translate GitHub repository documentation into multiple languages using Lingo.dev CLI + Web Preview

ReadMeLingo consists of two parts:
- **CLI Tool**: Run locally to translate repository documentation using Lingo.dev
- **Web App**: Preview, download, and create PRs with translated files

This architecture ensures fast, reliable translations that work everywhere (including serverless deployments).

## ✨ Features

### CLI Tool
- 🚀 **Fast Translation**: Run locally with no timeout limits
- 🌐 **10+ Languages**: Support for Spanish, French, German, Portuguese, Japanese, Chinese, Hindi, Arabic, Russian, and Bengali
- 📁 **Flexible Output**: Save translations to any directory
- 🔧 **Works Everywhere**: Run on your machine, CI/CD, or anywhere Node.js runs

### Web App
- 👀 **Live Preview**: View rendered markdown translations
- 📦 **Bulk Download**: Download all translations as a ZIP file
- 🔄 **PR Creation**: Automatically create pull requests with translated files
- 📤 **File Upload**: Upload CLI-generated translations for preview
- 🎨 **Beautiful UI**: Modern, responsive interface built with Next.js and shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Lingo.dev API key (get one at [lingo.dev](https://lingo.dev))
- (Optional) GitHub Personal Access Token for private repos and PR creation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/readmelingo.git
cd readmelingo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
LINGODOTDEV_API_KEY=your_lingo_api_key_here
GITHUB_TOKEN=your_github_token_here  # Optional
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

### Option 1: CLI + Web App (Recommended)

1. **Run CLI to translate**:
   ```bash
   export LINGODOTDEV_API_KEY=your_key_here
   npm run cli translate -- --repo owner/repo --languages es,fr,de
   ```

2. **Upload to web app**:
   - Start web app: `npm run dev`
   - Click "Upload Translated Files"
   - Select all `.md` files from `./translations/`

3. **Preview & Create PR**: Use the web app to preview, download, or create a PR

### Option 2: Web App Only (Limited)

The web app can also fetch and translate directly, but this is slower and may timeout on large files. CLI is recommended for best performance.

## 🏗️ Architecture

### CLI Tool
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **Translation**: Lingo.dev CLI (runs locally)
- **GitHub Integration**: GitHub REST API
- **Output**: Files saved to disk

### Web App
- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes (for file upload, PR creation, ZIP generation)
- **Translation**: Accepts pre-translated files from CLI
- **GitHub Integration**: GitHub REST API (for PR creation)
- **Markdown Rendering**: react-markdown with remark-gfm

## 📁 Project Structure

```
readmelingo/
├── cli/                  # CLI tool
│   ├── index.ts         # CLI entry point
│   └── commands/
│       └── translate.ts # Translation command
├── app/                  # Web app
│   ├── api/             # API routes
│   │   ├── upload-translations/
│   │   ├── create-pr/
│   │   └── download-zip/
│   ├── preview/          # Preview results page
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── markdown-viewer.tsx
│   └── translation-preview.tsx
├── lib/                 # Shared utilities
│   ├── github.ts        # GitHub API helpers
│   ├── lingo.ts         # Lingo CLI integration
│   ├── markdown.ts      # Markdown utilities
│   └── zip.ts           # ZIP generation
└── .env.example         # Environment variables template
```

## 🔑 Environment Variables

### CLI Tool
| Variable | Required | Description |
|----------|----------|-------------|
| `LINGODOTDEV_API_KEY` | Yes | Your Lingo.dev API key for translations |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (for private repos) |

### Web App
| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (for PR creation) |

Note: The web app doesn't need `LINGODOTDEV_API_KEY` since translations are done via CLI.

## 🌍 Supported Languages

- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇵🇹 Portuguese (pt)
- 🇯🇵 Japanese (ja)
- 🇨🇳 Chinese Simplified (zh-CN)
- 🇮🇳 Hindi (hi)
- 🇸🇦 Arabic (ar)
- 🇷🇺 Russian (ru)
- 🇧🇩 Bengali (bn)

## 🛠️ Development

### Running the CLI

```bash
# Development (with tsx)
npm run cli translate -- --repo owner/repo

# Build and run
npm run cli:build
npm run cli:run translate -- --repo owner/repo
```

### Running the Web App

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Lingo.dev](https://lingo.dev) for the amazing translation API
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Next.js](https://nextjs.org) for the awesome framework

## 📚 Documentation

- **[CLI_README.md](./CLI_README.md)** - Complete CLI documentation
- **[CLI_QUICKSTART.md](./CLI_QUICKSTART.md)** - Quick start guide for CLI
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start for web app

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by the ReadMeLingo team
