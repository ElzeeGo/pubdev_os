export function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <span className="text-sm text-muted-foreground">AI-Powered Generation</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Content that converts. Automatically.</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Generate high-quality, engaging content tailored for each platform. Our AI understands your brand voice,
            audience preferences, and SEO requirements to create content that drives results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Social Media Posts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate engaging posts for X, LinkedIn, Facebook, Instagram, and Reddit with optimal hashtags and timing.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>Platform-specific optimization</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>Hashtag research & suggestions</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>Manual editing and approval workflow</span>
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Blog Articles</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create comprehensive, SEO-optimized blog posts that rank well and engage your audience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>SEO keyword optimization</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>Structured content outlines</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-primary"></div>
                <span>Manual drafts with versioning</span>
              </div>
            </div>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-lg p-6 backdrop-blur-sm relative">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                NEW
              </span>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              AI Video Generation
              <span className="ml-2 text-xs text-purple-400">with Sora 2</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate professional promotional videos automatically using OpenAI's Sora 2. Perfect for social media announcements.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                <span>4K quality up to 12 seconds</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                <span>Multiple aspect ratios</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                <span>Manual prompts and shot list support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

