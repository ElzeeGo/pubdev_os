import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { ContentFlow } from "@/components/landing/content-flow"
import { Stats } from "@/components/landing/stats"
import { Features } from "@/components/landing/features"
import { ContentShowcase } from "@/components/landing/content-showcase"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pubdev.app"
const siteName = "pubdev"
const siteDescription = "AI-powered content generation platform for X (Twitter). Create engaging tweets, analyze performance, and grow your audience with intelligent automation."

export const metadata: Metadata = {
  title: {
    default: `${siteName} - AI-Powered Content Generator for X`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "X content generator",
    "Twitter content creator",
    "AI tweet generator",
    "social media automation",
    "content marketing",
    "X analytics",
    "Twitter growth",
    "AI writing assistant",
    "social media management",
    "content scheduling",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - AI-Powered Content Generation for X`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${siteName} - AI-Powered Content Generation for X`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - AI-Powered Content Generation for X`,
    description: siteDescription,
    images: [`${siteUrl}/opengraph-image`],
    creator: "@pubdev",
    site: "@pubdev",
  },
  alternates: {
    canonical: siteUrl,
  },
  metadataBase: new URL(siteUrl),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: "technology",
  classification: "Business Software",
  other: {
    "application-name": siteName,
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": siteName,
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
  },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      priceValidUntil: "2025-12-31",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    creator: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    featureList: [
      "AI-powered content generation",
      "Performance analytics",
      "Multi-variant testing",
      "Audience growth tools",
      "Content scheduling",
      "Engagement insights",
    ],
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* JSON-LD structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      <main>
        <Hero />
        <ContentShowcase />
        <ContentFlow />
        <Stats />
        <Features />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
