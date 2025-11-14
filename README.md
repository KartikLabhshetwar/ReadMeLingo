# ReadMeLingo 🌍

> Instantly translate your GitHub repository documentation into multiple languages using Lingo.dev

ReadMeLingo is a web-based tool that automatically translates your GitHub repository's documentation (README.md, CONTRIBUTING.md, and /docs files) into multiple languages, making your open-source projects accessible to a global audience.

## ✨ Features

- 🚀 **Instant Translation**: Translate README and documentation files in seconds
- 🌐 **10+ Languages**: Support for Spanish, French, German, Portuguese, Japanese, Chinese, Hindi, Arabic, Russian, and Bengali
- 👀 **Live Preview**: View rendered markdown translations before downloading
- 📦 **Bulk Download**: Download all translations as a ZIP file
- 🔄 **PR Creation**: Automatically create pull requests with translated files
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

1. **Enter Repository URL**: Paste your GitHub repository URL (e.g., `https://github.com/owner/repo`)
2. **Select Files**: Choose which documentation files to translate (README.md, CONTRIBUTING.md, /docs)
3. **Choose Languages**: Select target languages from 10+ supported options
4. **Translate**: Click "Translate Files" and wait a few seconds
5. **Preview & Download**: View translations, copy to clipboard, download individual files, or get all as ZIP
6. **Create PR** (Optional): Automatically create a pull request with all translated files

## 🏗️ Architecture

ReadMeLingo is built with:

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Translation**: Lingo.dev CLI (executed server-side)
- **GitHub Integration**: GitHub REST API
- **Markdown Rendering**: react-markdown with remark-gfm

## 📁 Project Structure

```
readmelingo/
├── app/
│   ├── api/              # API routes
│   │   ├── fetch-readme/
│   │   ├── translate/
│   │   ├── create-pr/
│   │   └── download-zip/
│   ├── translate/        # Translation workflow page
│   ├── preview/          # Preview results page
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── repo-input.tsx
│   ├── file-selector.tsx
│   ├── language-selector.tsx
│   ├── markdown-viewer.tsx
│   ├── translation-preview.tsx
│   └── create-pr-dialog.tsx
├── lib/                 # Utility functions
│   ├── github.ts        # GitHub API helpers
│   ├── lingo.ts         # Lingo CLI integration
│   ├── markdown.ts      # Markdown utilities
│   └── zip.ts           # ZIP generation
└── .env.example         # Environment variables template
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINGODOTDEV_API_KEY` | Yes | Your Lingo.dev API key for translations |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (needed for private repos and PR creation) |

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

### Running Tests

```bash
npm test
```

### Building for Production

```bash
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

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by the ReadMeLingo team
