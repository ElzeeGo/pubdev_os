"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Note: For logged-in users with an organization, we'll use CreditPurchaseButton instead
// This component shows signup CTAs for non-authenticated users

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <span className="text-sm text-muted-foreground">Pay As You Go</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Simple, usage-based pricing</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Only pay for what you use. Powered by GPT-5, Gemini Flash, and Sora 2. No subscriptions, no hidden fees. Credits never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {/* Starter Credits */}
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Starter</CardTitle>
              <CardDescription className="text-muted-foreground">
                Perfect for trying out
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">$4.99</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">$4.99 in credits</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~500 text generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~40 images</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~2 videos (8 sec)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Credits never expire</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full border-border/50" size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Popular Credits */}
          <Card className="relative bg-card/50 border-2 border-primary/50 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">Popular</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold">Professional</CardTitle>
              <CardDescription className="text-muted-foreground">
                Best value for regular use
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">$50</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">$50 in credits</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~5,000 text generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~417 images</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~25 videos (8 sec)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Credits never expire</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold">Best value</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Credits */}
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
              <CardDescription className="text-muted-foreground">For teams & heavy usage</CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">$200</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">One-time purchase</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">$200 in credits</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~20,000 text generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~1,667 images</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">~100 videos (8 sec)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Credits never expire</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold">Maximum value</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full border-border/50" size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Usage-based pricing details */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/30 border border-border/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold">What&apos;s included</CardTitle>
              <CardDescription>All credit packages include access to these features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">All platforms (X, LinkedIn, etc.)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Automated codebase analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">SEO optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm">Team collaboration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing breakdown */}
        <div className="text-center mt-12 space-y-4">
          <h3 className="text-lg font-semibold">Transparent pricing</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Text Generation:</span> $0.01-$0.05 per generation
            </div>
            <div>
              <span className="font-medium">Image Generation:</span> $0.12 per image
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Powered by GPT-5 (text) & Nano Banana (images) • Credits never expire • Mix and match
          </p>
        </div>
      </div>
    </section>
  )
}

