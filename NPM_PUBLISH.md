# Publishing ReadMeLingo to npm

## ✅ Package Configuration Complete

The package is now configured for npm publishing with:

- ✅ `bin` field configured for CLI binary
- ✅ `files` field to control what gets published
- ✅ `prepublishOnly` script to build before publishing
- ✅ Proper metadata (description, keywords, repository)
- ✅ Minimal dependencies (only CLI essentials)
- ✅ Next.js/React moved to optionalDependencies
- ✅ `.npmignore` file to exclude unnecessary files

## 📦 What Gets Published

Only essential files for the CLI:
- `dist/` - Compiled CLI code
- `lib/` - Shared utilities (github.ts, lingo.ts, etc.)
- `CLI_README.md` - CLI documentation
- `CLI_QUICKSTART.md` - Quick start guide
- `LICENSE` - License file
- `README.md` - Main readme

## 🚀 Before Publishing

1. **Update repository URLs** in `package.json`:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/YOUR_USERNAME/readmelingo.git"
   }
   ```

2. **Add author information**:
   ```json
   "author": "Your Name <your.email@example.com>"
   ```

3. **Test the build**:
   ```bash
   npm run cli:build
   npm run cli:run translate -- --repo owner/repo
   ```

4. **Test installation locally**:
   ```bash
   npm pack
   npm install -g ./readmelingo-0.1.0.tgz
   readmelingo --version
   ```

5. **Verify package contents**:
   ```bash
   tar -tzf readmelingo-0.1.0.tgz | head -20
   ```

## 📤 Publishing Steps

1. **Login to npm** (if not already):
   ```bash
   npm login
   ```

2. **Check package name availability**:
   ```bash
   npm view readmelingo
   ```
   If it exists, you may need to use a scoped package: `@yourusername/readmelingo`

3. **Publish**:
   ```bash
   npm publish
   ```

   For scoped packages (if name is taken):
   ```bash
   npm publish --access public
   ```

4. **Verify installation**:
   ```bash
   npm install -g readmelingo
   readmelingo --version
   ```

## 🎯 After Publishing

Users can install and use:

```bash
# Global installation
npm install -g readmelingo

# Use the CLI
export LINGODOTDEV_API_KEY=your_key
readmelingo translate --repo owner/repo
```

## 📝 Version Management

- Update version in `package.json` before each publish
- Use semantic versioning: `0.1.0` → `0.1.1` (patch), `0.2.0` (minor), `1.0.0` (major)
- Or use: `npm version patch|minor|major`

## ⚠️ Important Notes

1. **Landing Page**: The Next.js landing page (`app/`) is NOT included in the npm package. Deploy it separately (Vercel, Netlify, etc.)

2. **Dependencies**: Only essential CLI dependencies are included. Next.js/React are optional and won't be installed unless needed.

3. **Build Required**: The `prepublishOnly` script automatically builds the CLI before publishing, so `dist/` must be generated.

4. **Node Version**: Requires Node.js 18+ (specified in `engines` field)

## 🔍 Package Quality Checklist

- [x] CLI binary configured correctly
- [x] Minimal dependencies
- [x] Proper file inclusion/exclusion
- [x] Build script configured
- [x] Documentation included
- [ ] Repository URL updated
- [ ] Author information added
- [ ] Tested local installation
- [ ] Version number appropriate

