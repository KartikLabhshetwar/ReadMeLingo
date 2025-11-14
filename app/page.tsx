export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <header className="mb-32">
          <div className="border-b border-black pb-8 mb-16">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
              ReadMeLingo
            </h1>
            <p className="text-xl md:text-2xl text-black/60 font-light max-w-2xl">
              Translate GitHub repository documentation into multiple languages using Lingo.dev
            </p>
          </div>
        </header>

        <section className="mb-32">
          <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6">Installation</h2>
              <div className="space-y-4 font-mono text-sm bg-black text-white p-6">
                <div>
                  <span className="text-white/60">$</span> npm install -g readmelingo
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              <div className="space-y-4 font-mono text-sm bg-black text-white p-6">
                <div>
                  <span className="text-white/60">$</span> export LINGODOTDEV_API_KEY=your_key
                </div>
                <div>
                  <span className="text-white/60">$</span> readmelingo translate --repo owner/repo
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12">Usage</h2>
          <div className="space-y-8">
            <div className="border-l-4 border-black pl-6">
              <h3 className="text-xl font-semibold mb-3">Basic Translation</h3>
              <div className="font-mono text-sm bg-black/5 p-4 mb-2">
                readmelingo translate --repo owner/repo
              </div>
              <p className="text-black/60">Translates README.md to Spanish, French, and German by default.</p>
            </div>

            <div className="border-l-4 border-black pl-6">
              <h3 className="text-xl font-semibold mb-3">Custom Languages</h3>
              <div className="font-mono text-sm bg-black/5 p-4 mb-2">
                readmelingo translate --repo owner/repo --languages es,fr,de,it,pt
              </div>
              <p className="text-black/60">Specify target languages as a comma-separated list.</p>
            </div>

            <div className="border-l-4 border-black pl-6">
              <h3 className="text-xl font-semibold mb-3">Include Additional Files</h3>
              <div className="font-mono text-sm bg-black/5 p-4 mb-2">
                readmelingo translate --repo owner/repo --include-contributing --include-docs
              </div>
              <p className="text-black/60">Include CONTRIBUTING.md and files from the /docs folder.</p>
            </div>

            <div className="border-l-4 border-black pl-6">
              <h3 className="text-xl font-semibold mb-3">Custom Output Directory</h3>
              <div className="font-mono text-sm bg-black/5 p-4 mb-2">
                readmelingo translate --repo owner/repo --output ./my-translations
              </div>
              <p className="text-black/60">Save translations to a custom directory.</p>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="text-4xl font-bold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-2">Fast Translation</h3>
              <p className="text-black/60">Run locally with no timeout limits. Perfect for large repositories.</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-2">Multiple Languages</h3>
              <p className="text-black/60">Support for 8+ languages including Spanish, French, German, and more.</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-2">Flexible Output</h3>
              <p className="text-black/60">Save translations to any directory. Works everywhere Node.js runs.</p>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12">Supported Languages</h2>
          <div className="grid md:grid-cols-4 gap-6 font-mono text-sm">
            <div>Spanish (es)</div>
            <div>French (fr)</div>
            <div>German (de)</div>
            <div>Italian (it)</div>
            <div>Portuguese (pt)</div>
            <div>Japanese (ja)</div>
            <div>Korean (ko)</div>
            <div>Chinese (zh)</div>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="text-3xl font-bold mb-12">Requirements</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-black mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold">Node.js 18+</p>
                <p className="text-black/60">Required to run the CLI tool</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-black mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold">Lingo.dev API Key</p>
                <p className="text-black/60">Get one at <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="underline">lingo.dev</a></p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-black mt-2 shrink-0"></div>
              <div>
                <p className="font-semibold">GitHub Token (Optional)</p>
                <p className="text-black/60">Required for private repositories</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-black pt-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-black/60 text-sm">Powered by <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="underline">Lingo.dev</a></p>
            </div>
            <div className="text-black/60 text-sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
