"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import FooterSection from "@/components/footer-section"

const languages = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "he", name: "Hebrew", flag: "🇮🇱" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ca", name: "Catalan", flag: "🇪🇸" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "sk", name: "Slovak", flag: "🇸🇰" },
  { code: "sl", name: "Slovenian", flag: "🇸🇮" },
  { code: "lt", name: "Lithuanian", flag: "🇱🇹" },
  { code: "lv", name: "Latvian", flag: "🇱🇻" },
  { code: "et", name: "Estonian", flag: "🇪🇪" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "tl", name: "Filipino", flag: "🇵🇭" },
]

function CodeBlock({ children, language = "bash" }: { children: string; language?: string }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[rgba(2,6,23,0.08)] bg-[#f7f5f3]">
      <div className="px-4 py-2 border-b border-[rgba(2,6,23,0.08)] bg-white/50">
        <span className="text-xs text-[#605A57] font-mono">{language}</span>
      </div>
      <pre className="px-4 py-3 overflow-x-auto">
        <code className="text-sm text-[#322D2B] font-mono leading-relaxed whitespace-pre">{children}</code>
      </pre>
    </div>
  )
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="w-full py-8 md:py-12 border-b border-[rgba(55,50,47,0.12)]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#49423D] mb-6">{title}</h2>
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  )
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState("installation")

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="w-full border-b border-[rgba(55,50,47,0.12)] bg-[#f7f5f3]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#49423D] mb-4">Documentation</h1>
          <p className="text-lg text-[#605A57]">
            Complete guide to using ReadMeLingo CLI to translate your GitHub documentation
          </p>
        </div>
      </div>

      <div className="w-full border-b border-[rgba(55,50,47,0.12)] bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="flex overflow-x-auto gap-1 py-4">
            {[
              { id: "installation", label: "Installation" },
              { id: "setup", label: "Setup" },
              { id: "commands", label: "Commands" },
              { id: "examples", label: "Examples" },
              { id: "languages", label: "Languages" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#322D2B] text-white"
                    : "text-[#605A57] hover:bg-[rgba(50,45,43,0.05)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Section id="installation" title="Installation">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-2">Option 1: Install from npm (Recommended)</h3>
            <CodeBlock>npm install -g readmelingo</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-2">Option 2: Install from Source</h3>
            <CodeBlock>{`git clone https://github.com/KartikLabhshetwar/ReadMeLingo.git
cd ReadMeLingo
npm install
npm run cli:build`}</CodeBlock>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-[#49423D]">
              <strong>Note:</strong> Requires Node.js 18 or higher. Check your version with <code className="bg-white px-1 rounded">node --version</code>
            </p>
          </div>
        </div>
      </Section>

      <Section id="setup" title="Setup">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">1. Get Your Lingo.dev API Key</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#605A57] mb-4">
              <li>Visit <a href="https://lingo.dev/auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://lingo.dev/auth</a></li>
              <li>Sign up or log in to your account</li>
              <li>Navigate to <strong>Projects → Your Project → API Key</strong></li>
              <li>Copy your API key (format: <code className="bg-[#f7f5f3] px-1 rounded">api_...</code> or <code className="bg-[#f7f5f3] px-1 rounded">lingo_...</code>)</li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">2. Set Your API Key</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-[#49423D] mb-2">Option A: Environment Variable (One-time use)</h4>
                <CodeBlock>export LINGODOTDEV_API_KEY=your_api_key_here</CodeBlock>
              </div>

              <div>
                <h4 className="font-medium text-[#49423D] mb-2">Option B: .env File (Recommended for development)</h4>
                <CodeBlock>{`# Create .env file in your project root
LINGODOTDEV_API_KEY=your_api_key_here
GITHUB_TOKEN=your_github_token_here  # Optional, for private repos`}</CodeBlock>
              </div>

              <div>
                <h4 className="font-medium text-[#49423D] mb-2">Option C: Persistent Setup (Recommended for regular use)</h4>
                <CodeBlock>{`# Add to ~/.zshrc or ~/.bashrc
echo 'export LINGODOTDEV_API_KEY=your_api_key_here' >> ~/.zshrc
source ~/.zshrc`}</CodeBlock>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">3. (Optional) GitHub Token for Private Repositories</h3>
            <ol className="list-decimal list-inside space-y-2 text-[#605A57] mb-4">
              <li>Go to <strong>GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</strong></li>
              <li>Generate a new token with <code className="bg-[#f7f5f3] px-1 rounded">repo</code> scope</li>
              <li>Set it as an environment variable:</li>
            </ol>
            <CodeBlock>export GITHUB_TOKEN=ghp_your_token_here</CodeBlock>
          </div>
        </div>
      </Section>

      <Section id="commands" title="Commands">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-[#49423D] mb-3">Interactive Mode</h3>
            <p className="text-[#605A57] mb-4">
              Run ReadMeLingo without any arguments to enter interactive mode. The CLI will guide you through the translation process with prompts.
            </p>
            <CodeBlock>readmelingo</CodeBlock>
            <p className="text-sm text-[#605A57] mt-2">
              This will start an interactive session where you can:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#605A57] mt-2 ml-4">
              <li>Select the repository to translate</li>
              <li>Choose which files to include (README.md, CONTRIBUTING.md, /docs folder)</li>
              <li>Select target languages from a list</li>
              <li>Specify output directory</li>
              <li>Provide GitHub token if needed</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#49423D] mb-3">Translate Command</h3>
            <p className="text-[#605A57] mb-4">
              Use the <code className="bg-[#f7f5f3] px-1 rounded">translate</code> command to translate repository documentation with options.
            </p>
            
            <div className="mb-4">
              <h4 className="font-medium text-[#49423D] mb-2">Basic Syntax</h4>
              <CodeBlock>readmelingo translate [options]</CodeBlock>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-[#49423D] mb-3">Options</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f7f5f3]">
                      <th className="border border-[rgba(2,6,23,0.08)] px-4 py-2 text-left text-sm font-semibold text-[#49423D]">Option</th>
                      <th className="border border-[rgba(2,6,23,0.08)] px-4 py-2 text-left text-sm font-semibold text-[#49423D]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-[#605A57]">
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">-r, --repo &lt;repo&gt;</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">GitHub repository URL or owner/repo format</td>
                    </tr>
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">-t, --token &lt;token&gt;</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">GitHub personal access token (for private repos)</td>
                    </tr>
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">-l, --languages &lt;languages&gt;</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">Comma-separated list of target language codes (e.g., es,fr,de)</td>
                    </tr>
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">-o, --output &lt;dir&gt;</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">Output directory for translated files (default: ./translations)</td>
                    </tr>
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">--include-contributing</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">Include CONTRIBUTING.md file in translation</td>
                    </tr>
                    <tr>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2 font-mono">--include-docs</td>
                      <td className="border border-[rgba(2,6,23,0.08)] px-4 py-2">Include /docs folder in translation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-[#49423D] mb-2">Repository Format</h4>
              <p className="text-sm text-[#605A57] mb-2">You can specify repositories in two formats:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#605A57] ml-4">
                <li><code className="bg-[#f7f5f3] px-1 rounded">owner/repo</code> - e.g., <code className="bg-[#f7f5f3] px-1 rounded">facebook/react</code></li>
                <li><code className="bg-[#f7f5f3] px-1 rounded">https://github.com/owner/repo</code> - Full GitHub URL</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#49423D] mb-3">Version Command</h3>
            <p className="text-[#605A57] mb-4">Check the installed version of ReadMeLingo.</p>
            <CodeBlock>readmelingo --version</CodeBlock>
            <p className="text-sm text-[#605A57] mt-2">or</p>
            <CodeBlock>readmelingo -V</CodeBlock>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#49423D] mb-3">Help Command</h3>
            <p className="text-[#605A57] mb-4">Display help information for commands.</p>
            <CodeBlock>readmelingo --help</CodeBlock>
            <p className="text-sm text-[#605A57] mt-2">or</p>
            <CodeBlock>readmelingo -h</CodeBlock>
          </div>
        </div>
      </Section>

      <Section id="examples" title="Examples">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 1: Basic Translation (Interactive Mode)</h3>
            <CodeBlock>{`# Start interactive mode
readmelingo

# The CLI will prompt you for:
# - Repository URL
# - Files to include
# - Target languages
# - Output directory
# - GitHub token (if needed)`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 2: Translate README to Multiple Languages</h3>
            <CodeBlock>{`readmelingo translate \\
  --repo facebook/react \\
  --languages es,fr,de,ja,ko \\
  --output ./translations`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 3: Include CONTRIBUTING.md</h3>
            <CodeBlock>{`readmelingo translate \\
  --repo owner/repo \\
  --languages es,fr \\
  --include-contributing \\
  --output ./docs/translations`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 4: Translate Entire /docs Folder</h3>
            <CodeBlock>{`readmelingo translate \\
  --repo owner/repo \\
  --languages es,fr,de,it,pt \\
  --include-docs \\
  --output ./i18n`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 5: Private Repository with Token</h3>
            <CodeBlock>{`readmelingo translate \\
  --repo owner/private-repo \\
  --token ghp_your_token_here \\
  --languages es,fr \\
  --output ./translations`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 6: Using Environment Variables</h3>
            <CodeBlock>{`# Set environment variables
export LINGODOTDEV_API_KEY=your_api_key
export GITHUB_TOKEN=ghp_your_token

# Run translation
readmelingo translate \\
  --repo owner/repo \\
  --languages es,fr,de`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#49423D] mb-3">Example 7: Full URL Format</h3>
            <CodeBlock>{`readmelingo translate \\
  --repo https://github.com/owner/repo \\
  --languages es,fr,de,ja \\
  --include-contributing \\
  --include-docs \\
  --output ./translations`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section id="languages" title="Supported Languages">
        <div className="space-y-4">
          <p className="text-[#605A57] mb-4">
            ReadMeLingo supports 40+ languages. Use the language codes below with the <code className="bg-[#f7f5f3] px-1 rounded">--languages</code> option.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className="px-4 py-2 border border-[rgba(2,6,23,0.08)] rounded-lg bg-white hover:bg-[#f7f5f3] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-sm font-medium text-[#49423D]">{lang.name}</div>
                    <div className="text-xs text-[#605A57] font-mono">{lang.code}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="w-full py-12 bg-[#f7f5f3]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="bg-white rounded-lg border border-[rgba(2,6,23,0.08)] p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#49423D] mb-4">Output Structure</h2>
            <p className="text-[#605A57] mb-4">
              Translated files are saved with the following naming convention:
            </p>
            <CodeBlock>{`translations/
├── README.es.md      # Spanish translation
├── README.fr.md      # French translation
├── README.de.md      # German translation
├── CONTRIBUTING.es.md
├── CONTRIBUTING.fr.md
└── docs/
    ├── getting-started.es.md
    ├── getting-started.fr.md
    └── ...`}</CodeBlock>
          </div>
        </div>
      </div>

      <div className="w-full py-12 border-b border-[rgba(55,50,47,0.12)]">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-semibold text-[#49423D] mb-4">Best Practices</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#322D2B] text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[#49423D] mb-1">Use Environment Variables</h3>
                <p className="text-[#605A57] text-sm">
                  Store your API keys in environment variables or .env files. Never commit them to version control.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#322D2B] text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[#49423D] mb-1">Batch Translations</h3>
                <p className="text-[#605A57] text-sm">
                  Translate to multiple languages in a single command for faster processing and better API efficiency.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#322D2B] text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[#49423D] mb-1">Review Translations</h3>
                <p className="text-[#605A57] text-sm">
                  Always review translated content, especially technical terms and code examples that may need manual adjustment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}

