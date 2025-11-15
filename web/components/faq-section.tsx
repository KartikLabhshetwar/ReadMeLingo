"use client"

import { useState } from "react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is ReadMeLingo and who is it for?",
    answer:
      "ReadMeLingo is a CLI tool that translates GitHub repository documentation into multiple languages using the Lingo.dev SDK. It's perfect for open source maintainers, developers, and teams who want to make their documentation accessible to global audiences.",
  },
  {
    question: "How does the translation process work?",
    answer:
      "ReadMeLingo uses Lingo.dev's efficient batch translation API. It fetches markdown files from GitHub, translates each file to all target languages in a single API call (using batchLocalizeText), and saves the translated files with locale suffixes (e.g., README.es.md). This makes it 3-5x faster than sequential translation.",
  },
  {
    question: "What languages are supported?",
    answer:
      "ReadMeLingo supports 40+ languages including Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, Arabic, Hindi, and many more. You can use any valid ISO 639-1 language code supported by Lingo.dev.",
  },
  {
    question: "Do I need a Lingo.dev API key?",
    answer:
      "Yes, you need a Lingo.dev API key to use ReadMeLingo. You can get one for free at lingo.dev/auth. The tool is completely free and open source - you only pay for Lingo.dev's translation API usage based on their pricing.",
  },
  {
    question: "Can I use ReadMeLingo with private repositories?",
    answer:
      "Yes! ReadMeLingo supports private repositories. You'll need to provide a GitHub Personal Access Token with the 'repo' scope. You can set it via the --token flag or the GITHUB_TOKEN environment variable.",
  },
  {
    question: "How do I get started with ReadMeLingo?",
    answer:
      "Getting started is simple! Install from npm with 'npm install -g readmelingoo', set your LINGODOTDEV_API_KEY environment variable, and run 'readmelingoo translate --repo owner/repo'. The tool also has an interactive mode that guides you through the setup.",
  },
]

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-4 md:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        {/* Left Column - Header */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <div className="w-full flex flex-col justify-center text-[#49423D] font-semibold leading-tight md:leading-[44px] font-sans text-4xl tracking-tight">
            Frequently Asked Questions
          </div>
          <div className="w-full text-[#605A57] text-base font-normal leading-7 font-sans">
            Common questions about ReadMeLingo and how to
            <br className="hidden md:block" />
            translate your GitHub documentation.
          </div>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div key={index} className="w-full border-b border-[rgba(73,66,61,0.16)] overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left hover:bg-[rgba(73,66,61,0.02)] transition-colors duration-200"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 text-[#49423D] text-base font-medium leading-6 font-sans">
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <ChevronDownIcon
                        className={`w-6 h-6 text-[rgba(73,66,61,0.60)] transition-transform duration-300 ease-in-out ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-[18px] text-[#605A57] text-sm font-normal leading-6 font-sans">
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
