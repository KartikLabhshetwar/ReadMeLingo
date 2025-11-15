import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <header className="mb-24 md:mb-32">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              ReadMeLingo
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-black/70 font-light max-w-3xl mx-auto mb-8 leading-relaxed">
              Translate GitHub repository documentation into <span className="font-medium text-black">40+ languages</span> using Lingo.dev
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 h-auto"
                asChild
              >
                <a href="https://www.npmjs.com/package/readmelingo" target="_blank" rel="noopener noreferrer">
                  Install from npm
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-8 py-6 h-auto"
                asChild
              >
                <a href="https://github.com/KartikLabhshetwar/ReadMeLingo" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </header>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Get Started in Seconds</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto mb-4">
              Install globally from npm and start translating your documentation
            </p>
            <div className="flex justify-center gap-2 items-center">
              <a 
                href="https://www.npmjs.com/package/readmelingo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img 
                  src="https://img.shields.io/npm/v/readmelingo.svg" 
                  alt="npm version" 
                  className="h-6"
                />
              </a>
              <a 
                href="https://www.npmjs.com/package/readmelingo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img 
                  src="https://img.shields.io/npm/dm/readmelingo.svg" 
                  alt="npm downloads" 
                  className="h-6"
                />
              </a>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Installation</CardTitle>
                <CardDescription>Install from npm globally</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-black text-white p-6 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">$</span>
                    <span>npm install -g readmelingo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Start</CardTitle>
                <CardDescription>Set your API key and translate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 font-mono text-sm bg-black text-white p-6 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">$</span>
                    <span>export LINGODOTDEV_API_KEY=your_key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">$</span>
                    <span>readmelingo translate --repo owner/repo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Usage Examples</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Powerful commands for all your translation needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Translation</CardTitle>
                <CardDescription>Translate README to default languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-black/5 p-4 rounded-lg mb-3">
                  readmelingo translate --repo owner/repo
                </div>
                <p className="text-sm text-black/60">Translates README.md to Spanish, French, and German by default.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Languages</CardTitle>
                <CardDescription>Specify your target languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-black/5 p-4 rounded-lg mb-3">
                  readmelingo translate --repo owner/repo --languages es,fr,de,it,pt
                </div>
                <p className="text-sm text-black/60">Specify target languages as a comma-separated list.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Include Additional Files</CardTitle>
                <CardDescription>Translate CONTRIBUTING and docs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-black/5 p-4 rounded-lg mb-3">
                  readmelingo translate --repo owner/repo --include-contributing --include-docs
                </div>
                <p className="text-sm text-black/60">Include CONTRIBUTING.md and files from the /docs folder.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Output Directory</CardTitle>
                <CardDescription>Save translations anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm bg-black/5 p-4 rounded-lg mb-3">
                  readmelingo translate --repo owner/repo --output ./my-translations
                </div>
                <p className="text-sm text-black/60">Save translations to a custom directory.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why ReadMeLingo?</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Fast, efficient, and reliable translation for your documentation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="text-5xl font-bold mb-2 text-black/10">01</div>
                <CardTitle className="text-2xl">Fast Batch Translation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Uses Lingo.dev's batch API to translate multiple languages in a single call. 3-5x faster than traditional methods.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-5xl font-bold mb-2 text-black/10">02</div>
                <CardTitle className="text-2xl">40+ Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Support for 40+ languages including Spanish, French, German, Japanese, Chinese, Arabic, and many more.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-5xl font-bold mb-2 text-black/10">03</div>
                <CardTitle className="text-2xl">Works Everywhere</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Run locally, in CI/CD, or anywhere Node.js runs. No timeout limits. Perfect for large repositories.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">40+ Supported Languages</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Translate your documentation into the world's most popular languages
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Spanish</div>
                <div className="text-sm text-black/60 font-mono">es</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">French</div>
                <div className="text-sm text-black/60 font-mono">fr</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">German</div>
                <div className="text-sm text-black/60 font-mono">de</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Italian</div>
                <div className="text-sm text-black/60 font-mono">it</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Portuguese</div>
                <div className="text-sm text-black/60 font-mono">pt</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Japanese</div>
                <div className="text-sm text-black/60 font-mono">ja</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Korean</div>
                <div className="text-sm text-black/60 font-mono">ko</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Chinese</div>
                <div className="text-sm text-black/60 font-mono">zh</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Russian</div>
                <div className="text-sm text-black/60 font-mono">ru</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Arabic</div>
                <div className="text-sm text-black/60 font-mono">ar</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">Hindi</div>
                <div className="text-sm text-black/60 font-mono">hi</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="font-semibold mb-1">+30 more</div>
                <div className="text-sm text-black/60">And counting</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Requirements</h2>
            <p className="text-xl text-black/60 max-w-2xl mx-auto">
              Everything you need to get started
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Node.js 18+</CardTitle>
                <CardDescription>Required to run the CLI tool</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lingo.dev API Key</CardTitle>
                <CardDescription>
                  Get one at{" "}
                  <a href="https://lingo.dev/auth" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                    lingo.dev/auth
                  </a>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>GitHub Token</CardTitle>
                <CardDescription>Optional - Required for private repositories</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <footer className="border-t border-black/20 pt-12 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-black/60 text-sm">
                Powered by{" "}
                <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
                  Lingo.dev
                </a>
              </p>
              <p className="text-black/40 text-xs mt-2">GPL-3.0 License</p>
            </div>
            <div className="flex gap-6 text-black/60 text-sm">
              <a href="https://github.com/KartikLabhshetwar/ReadMeLingo" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
                GitHub
              </a>
              <a href="https://lingo.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
