"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 text-sm bg-secondary/50 text-secondary-foreground rounded-full border border-border/50 mb-6">
            AI Content Automation
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
          Automated content generation from your <span className="text-muted-foreground">codebase</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 text-balance max-w-3xl mx-auto leading-relaxed">
          Automatically analyze your code, detect new features, and generate engaging <strong className="text-foreground">text, images, and AI videos</strong> for X, LinkedIn, Facebook,
          Instagram or Reddit. No manual input required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button asChild size="lg" className="bg-emerald-900 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/50 hover:shadow-xl hover:shadow-emerald-800/50 transition-all duration-300 border border-emerald-700/50">
            <Link href="/signup">Get Started</Link>
          </Button>
         
        </div>

        <div className="mb-16 text-center">
          <p className="text-xl md:text-2xl font-semibold mb-1">
            Try this ✨
          </p>
          <p className="text-sm md:text-base text-muted-foreground italic">
            (people are addicted)
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-mono">~ npm install -D pubdev</span>
        </div>
      </div>
    </section>
  )
}

