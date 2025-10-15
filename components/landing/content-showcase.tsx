"use client"

import DisplayCards from "@/components/ui/display-cards"
import { Twitter, Linkedin, Facebook, Instagram, MessageSquare, FileText } from "lucide-react"

export function ContentShowcase() {
  const socialCards = [
    {
      icon: <Twitter className="size-4 text-blue-300" />,
      title: "X",
      description: "🚀 Just shipped real-time webhooks!",
      date: "Just now",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Linkedin className="size-4 text-blue-300" />,
      title: "LinkedIn",
      description: "Excited to announce webhook support",
      date: "2 min ago",
      iconClassName: "text-blue-600",
      titleClassName: "text-blue-600",
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Facebook className="size-4 text-blue-300" />,
      title: "Facebook",
      description: "Great news! We just added webhooks to",
      date: "5 min ago",
      iconClassName: "text-blue-700",
      titleClassName: "text-blue-700",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ]

  const additionalCards = [
    {
      icon: <Instagram className="size-4 text-pink-300" />,
      title: "Instagram",
      description: "New feature alert! 🎉 Real-time webhoo",
      date: "8 min ago",
      iconClassName: "text-pink-500",
      titleClassName: "text-pink-500",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <MessageSquare className="size-4 text-orange-300" />,
      title: "Reddit",
      description: "We just launched webhook support for",
      date: "12 min ago",
      iconClassName: "text-orange-500",
      titleClassName: "text-orange-500",
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <FileText className="size-4 text-green-300" />,
      title: "Blog",
      description: "Introducing Webhook Events: A deep di",
      date: "15 min ago",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-24 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">See AI content generation in action</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how our AI transforms codebase changes into engaging, platform-optimized <strong className="text-foreground">text, images, and videos</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Input side */}
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Detected Code Change</span>
              </div>
              <div className="bg-secondary/30 rounded-md p-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2">Feature Added:</div>
                <div className="mb-4">"Real-time webhook system for payment events and notifications"</div>
                <div className="text-muted-foreground mb-2">Files Modified:</div>
                <div className="text-xs text-muted-foreground mb-4">
                  • lib/webhooks/events.ts
                  <br />• app/api/webhooks/route.ts
                  <br />• lib/payments/notifications.ts
                  <br />• components/webhook-config.tsx
                </div>
                <div className="text-muted-foreground mb-2">AI Analysis:</div>
                <div className="text-xs mb-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">High Impact</span>
                  <span className="ml-2 text-muted-foreground">Business value detected</span>
                </div>
                <div className="text-muted-foreground mb-2">Target Platforms:</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">X</span>
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">LinkedIn</span>
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">Facebook</span>
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">Instagram</span>
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">Reddit</span>
                  <span className="px-2 py-1 bg-primary/20 rounded text-xs">Blog</span>
                </div>
              </div>
            </div>

            {/* AI Generated Media */}
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">AI-Generated Media</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 ml-2">
                  NEW
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">AI Image</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Gemini 2.5 Flash</div>
                  <div className="aspect-video rounded border border-blue-400/30 overflow-hidden">
                    <img 
                      src="https://ckghkfkmjnyfruvqtste.supabase.co/storage/v1/object/public/landing/pubdev_ai.png"
                      alt="AI Generated Content"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">AI Video</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Sora 2</div>
                  <div className="aspect-video rounded border border-purple-400/30 overflow-hidden">
                    <video 
                      src="https://ckghkfkmjnyfruvqtste.supabase.co/storage/v1/object/public/landing/man_pubdev.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-6 text-center">
                Content designed, nurtured, perfect for each social platform
              </h3>
              <DisplayCards cards={socialCards} />
            </div>

            <div className="flex justify-center">
              <DisplayCards cards={additionalCards} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

