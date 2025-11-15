import type React from "react"
import type { Metadata } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "ReadMeLingo - Translate GitHub Documentation to 40+ Languages",
  description:
    "Translate GitHub repository documentation into multiple languages using Lingo.dev SDK. Fast batch translation for README, CONTRIBUTING, and docs files.",
  openGraph: {
    title: "ReadMeLingo - Translate GitHub Documentation to 40+ Languages",
    description:
      "Fast batch translation for README, CONTRIBUTING, and docs using Lingo.dev SDK. Works everywhere Node.js runs.",
    type: "website",
    images: [
      {
        url: "https://read-me-lingo.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "ReadMeLingo - Make your docs multilingual in 40+ languages instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadMeLingo - Translate GitHub Documentation to 40+ Languages",
    description:
      "Fast batch translation for README, CONTRIBUTING, and docs using Lingo.dev SDK. Works everywhere Node.js runs.",
    images: ["https://read-me-lingo.vercel.app/og.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
