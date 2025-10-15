"use client"

import { useEffect, useRef } from "react"

export function ContentFlow() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".flow-step")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
            From codebase to published content <span className="text-primary">automatically</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our AI analyzes your codebase, detects features and changes, then generates tailored content across X,
            LinkedIn, Facebook, Instagram, Reddit, and your blog.
          </p>
        </div>

        <div className="relative">
          {/* Desktop flow - horizontal */}
          <div className="hidden lg:grid lg:grid-cols-7 gap-4 items-center mb-16">
            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-100">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3">Scan Codebase</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI analyzes your code structure and recent changes
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-200">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3">Detect Features</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Identifies new features, updates, and improvements
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-300">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3">Generate Content</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Creates tailored posts, articles, and SEO content
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-400">
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-3">Auto-Publish</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Content goes live</p>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet flow - vertical */}
          <div className="lg:hidden space-y-8 mb-16">
            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-100">
              <div className="flex items-start gap-6 p-6 rounded-2xl bg-card/30 border border-border/50 hover:bg-card/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Scan Codebase</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI analyzes your code structure and recent changes to understand your project's evolution
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-200">
              <div className="flex items-start gap-6 p-6 rounded-2xl bg-card/30 border border-border/50 hover:bg-card/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Detect Features</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Identifies new features, updates, and improvements worth promoting to your audience
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-300">
              <div className="flex items-start gap-6 p-6 rounded-2xl bg-card/30 border border-border/50 hover:bg-card/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Generate Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Creates tailored posts, articles, and SEO content optimized for each platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-primary/50 to-primary/20 rounded-full"></div>
            </div>

            <div className="flow-step opacity-0 translate-y-4 transition-all duration-700 delay-400">
              <div className="flex items-start gap-6 p-6 rounded-2xl bg-card/30 border border-border/50 hover:bg-card/50 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Auto-Publish</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Content goes live automatically, reaching your audience instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-card/50 to-card/20 rounded-3xl border border-border/50 p-8 md:p-12 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works Behind the Scenes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-3 text-primary">Deep Code Analysis</h4>
              <p className="text-muted-foreground leading-relaxed">
                Scans your repository structure, commit history, pull requests, and documentation to understand your
                project's features and recent changes.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-3 text-primary">Intelligent Detection</h4>
              <p className="text-muted-foreground leading-relaxed">
                Uses advanced AI to identify new features, bug fixes, performance improvements, and other noteworthy
                changes worth promoting to your audience.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-lg mb-3 text-primary">Smart Content Creation</h4>
              <p className="text-muted-foreground leading-relaxed">
                Generates platform-specific content optimized for engagement, SEO, and your target audience across X,
                LinkedIn, Facebook, Instagram, Reddit, and blogs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}

