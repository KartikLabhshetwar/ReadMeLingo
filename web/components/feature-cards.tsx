export function FeatureCards() {
  const features = [
    {
      title: "Fast batch translation",
      description: "Translate to multiple languages in a single API call per file.\n3-5x faster than sequential translation.",
      highlighted: true,
    },
    {
      title: "40+ languages supported",
      description: "Support for Spanish, French, German, Japanese, Chinese,\nArabic, Hindi, and many more languages.",
      highlighted: false,
    },
    {
      title: "Works everywhere",
      description: "Run on your machine, CI/CD pipelines, or anywhere\nNode.js runs. No serverless timeout limits.",
      highlighted: false,
    },
  ]

  return (
    <section className="border-t border-[#e0dedb] border-b border-[#e0dedb]">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 flex flex-col gap-2 ${
                // Updated feature card borders to 1px
                feature.highlighted ? "bg-white border border-[#e0dedb] shadow-sm" : "border border-[#e0dedb]/80"
              }`}
            >
              {feature.highlighted && (
                <div className="space-y-1 mb-2">
                  <div className="w-full h-0.5 bg-[#322d2b]/8"></div>
                  <div className="w-32 h-0.5 bg-[#322d2b]"></div>
                </div>
              )}
              <h3 className="text-[#49423d] text-sm font-semibold leading-6">{feature.title}</h3>
              <p className="text-[#605a57] text-sm leading-[22px] whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
