import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full border-b border-[#37322f]/6 bg-[#f7f5f3]">
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-[#37322f] font-semibold text-lg">ReadMeLingo</a>
            <div className="hidden md:flex items-center space-x-6">
              <a href="/#features" className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Features</a>
              <a href="/docs" className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Documentation</a>
              <a href="https://github.com/KartikLabhshetwar/ReadMeLingo" target="_blank" rel="noopener noreferrer" className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">GitHub</a>
            </div>
          </div>
          <a href="https://www.npmjs.com/package/readmelingoo" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" className="text-[#37322f] hover:bg-[#37322f]/5">
              Install
            </Button>
          </a>
        </nav>
      </div>
    </header>
  )
}
