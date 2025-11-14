# ReadMeLingo Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Get Your Lingo.dev API Key
1. Visit [https://lingo.dev](https://lingo.dev)
2. Sign up for a free account
3. Navigate to your project settings
4. Copy your API key

### Step 3: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your API key
# LINGODOTDEV_API_KEY=your_actual_api_key_here
```

### Step 4: Run the Development Server
```bash
npm run dev
```

### Step 5: Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎯 Try It Out

### Test with a Public Repository

1. **Enter a GitHub URL**:
   ```
   https://github.com/vercel/next.js
   ```
   or just:
   ```
   vercel/next.js
   ```

2. **Select files** (README.md is auto-selected)

3. **Choose languages** (Spanish, French, German are pre-selected)

4. **Click "Translate Files"** and wait ~5 seconds

5. **Preview, download, or create a PR!**

---

## 🔧 Optional: GitHub Token Setup

For private repos or PR creation:

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for private repos)
   - `workflow` (for PR creation)
4. Generate and copy the token
5. Add to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

---

## 📦 Build for Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

---

## 🐛 Troubleshooting

### "Lingo.dev API key not configured"
- Make sure `.env.local` exists
- Verify `LINGODOTDEV_API_KEY` is set correctly
- Restart the dev server after adding the key

### "Failed to fetch repository"
- Check if the repo URL is correct
- For private repos, add a GitHub token
- Check your internet connection

### "Lingo CLI execution timed out"
- Large files may take longer
- Try with fewer files or languages
- Check Lingo.dev service status

---

## 💡 Pro Tips

1. **Start Small**: Test with just README.md and 2-3 languages first
2. **Use Tokens**: Even for public repos, tokens increase rate limits
3. **Preview First**: Always preview translations before creating PRs
4. **Download ZIP**: Great for backing up all translations at once

---

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Check [PROJECT_REQUIREMENTS.md](./PROJECT_REQUIREMENTS.md) for architecture details
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical overview

---

## 🎉 You're Ready!

Start translating your documentation and making your projects accessible to developers worldwide!

**Need help?** Open an issue on GitHub.

---

Made with ❤️ by ReadMeLingo

