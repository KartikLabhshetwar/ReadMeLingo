import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative pt-[216px] pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Hero Content */}
          <div className="max-w-[937px] flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-6">
              <h1 className="max-w-[748px] text-center text-[#37322f] text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif">
                Translate GitHub docs to 40+ languages instantly
              </h1>
              <p className="max-w-[506px] text-center text-[#37322f]/80 text-lg font-medium leading-7">
                Fast batch translation for README, CONTRIBUTING, and docs using Lingo.dev SDK. Works everywhere Node.js runs.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <a href="https://www.npmjs.com/package/readmelingo" target="_blank" rel="noopener noreferrer">
              <Button className="h-10 px-12 bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full font-medium text-sm shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]">
                Install from npm
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
