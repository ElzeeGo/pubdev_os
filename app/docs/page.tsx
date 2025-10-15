import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Zap, Shield, GitBranch, Terminal, Settings, Package } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl">pubdev</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/health" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Status
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">NPM Package Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Automatic social media content generation for your code releases. Install once, works forever—just like Sentry.
            </p>
            <div className="flex gap-3">
              <Badge variant="secondary" className="text-sm">
                <Terminal className="w-3 h-3 mr-1" />
                npm install pubdev
              </Badge>
              <Badge variant="outline" className="text-sm">
                v0.2.0
              </Badge>
              <a 
                href="https://www.npmjs.com/package/pubdev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm hover:underline text-muted-foreground hover:text-foreground transition-colors"
              >
                View on NPM →
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Card>
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Zero Config</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Works out of the box with sensible defaults for Next.js, React, and more
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <GitBranch className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">CI/CD Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Integrates seamlessly with GitHub Actions, Vercel, Netlify
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  API key authentication, encrypted communication, no source code storage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Tabs defaultValue="quickstart" className="mb-12">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="cicd">CI/CD</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Installation</CardTitle>
                  <CardDescription>Install the pubdev package in your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Using npm:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>npm install -D pubdev</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Using pnpm:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>pnpm add -D pubdev</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Using yarn:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>yarn add -D pubdev</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Get Your API Key</CardTitle>
                  <CardDescription>You'll need an API key to use the package</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      <Link href="/signup" className="text-primary hover:underline">Create an account</Link> on pubdev.app
                    </li>
                    <li>
                      <Link href="/dashboard" className="text-primary hover:underline">Create a project</Link> from your dashboard
                    </li>
                    <li>Navigate to your project's API Keys section</li>
                    <li>Generate a new API key</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Initialize in Your Project</CardTitle>
                  <CardDescription>Run the init command to set up pubdev</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>{`npx pubdev init`}</code>
                    </pre>
                    <p className="text-sm text-muted-foreground">
                      Follow the interactive prompts to configure your project. This creates a{" "}
                      <code className="bg-muted px-2 py-1 rounded">pubdev.config.js</code> file.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Scanning</CardTitle>
                  <CardDescription>Scan your project for changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Scan entire project:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>npx pubdev scan</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Scan specific files:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{`npx pubdev scan app/dashboard/page.tsx components/NewFeature.tsx`}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Scan changes since a commit:</p>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>npx pubdev scan --since HEAD~5</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration File</CardTitle>
                  <CardDescription>pubdev.config.js options</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`module.exports = {
  // Required
  apiKey: process.env.PUBDEV_API_KEY,
  projectId: "my-awesome-app",

  // Optional
  scan: {
    paths: ["app", "components", "lib"],
    ignore: ["**/*.test.*", "**/*.stories.*"],
  },
  
  triggers: {
    onBuild: true,
    onCommit: false,
    onPush: false,
  },
}`}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Path Examples by Project Type</CardTitle>
                  <CardDescription>Configure scan paths based on your framework</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Next.js 13+ App Router (no src)</h4>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`paths: ["app", "components", "lib"]`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Next.js 13+ App Router (with src)</h4>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`paths: ["src/app", "src/components", "src/lib"]`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">React (CRA, Vite)</h4>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`paths: ["src/components", "src/pages", "src/features"]`}</code>
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Next.js Pages Router</h4>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm">
                      <code>{`paths: ["pages", "components", "lib"]`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>Store your API key securely</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Add to .env or .env.local:</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <code>PUBDEV_API_KEY=sk_your_key_here</code>
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Then reference it in your config file using{" "}
                    <code className="bg-muted px-2 py-1 rounded">process.env.PUBDEV_API_KEY</code>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cicd" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>GitHub Actions</CardTitle>
                  <CardDescription>Add pubdev to your GitHub workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      
      # pubdev scan
      - name: Scan features
        run: npx pubdev scan
        env:
          PUBDEV_API_KEY: \${{ secrets.PUBDEV_API_KEY }}`}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Don't forget to add <code className="bg-muted px-2 py-1 rounded">PUBDEV_API_KEY</code> to your repository secrets.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vercel</CardTitle>
                  <CardDescription>Run pubdev after builds on Vercel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Option 1: Update package.json</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`{
  "scripts": {
    "build": "next build",
    "postbuild": "pubdev scan"
  }
}`}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Option 2: Project settings</p>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{`{
  "buildCommand": "npm run build && npx pubdev scan"
}`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add <code className="bg-muted px-2 py-1 rounded">PUBDEV_API_KEY</code> to your environment variables in Vercel project settings.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Netlify</CardTitle>
                  <CardDescription>Configure pubdev in netlify.toml</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`[build]
  command = "npm run build && npx pubdev scan"
  publish = "dist"

[build.environment]
  PUBDEV_API_KEY = "\${PUBDEV_API_KEY}"`}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Programmatic API</CardTitle>
                  <CardDescription>Use pubdev in your code</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`import { scan, loadConfig } from 'pubdev'

async function customScan() {
  const result = await scan()
  console.log('Scan ID:', result.scanId)
  console.log('Draft URL:', result.draftUrl)
}

customScan()`}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Exports</CardTitle>
                  <CardDescription>All exported functions and classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">scan()</code>
                      <p className="text-muted-foreground mt-1">Main scan function that analyzes your project and submits to pubdev</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">loadConfig()</code>
                      <p className="text-muted-foreground mt-1">Load pubdev configuration from pubdev.config.js</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">GitScanner</code>
                      <p className="text-muted-foreground mt-1">Class for Git operations and change detection</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">FeatureDetector</code>
                      <p className="text-muted-foreground mt-1">Detects features and components in your code</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">CodeParser</code>
                      <p className="text-muted-foreground mt-1">Parses React/TypeScript code and extracts metadata</p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded font-mono">pubdevAPIClient</code>
                      <p className="text-muted-foreground mt-1">HTTP client for pubdev API</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* How It Works */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>The pubdev workflow in 6 simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Scan</h4>
                    <p className="text-sm text-muted-foreground">pubdev analyzes your Git history and code changes</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Detect</h4>
                    <p className="text-sm text-muted-foreground">Identifies new/modified React components, pages, and features</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Parse</h4>
                    <p className="text-sm text-muted-foreground">Extracts component names, descriptions, and context</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Generate</h4>
                    <p className="text-sm text-muted-foreground">AI creates engaging social media posts with your branding</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h4 className="font-semibold mb-1">Review</h4>
                    <p className="text-sm text-muted-foreground">You review and edit generated content in the dashboard</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">6</div>
                  <div>
                    <h4 className="font-semibold mb-1">Publish</h4>
                    <p className="text-sm text-muted-foreground">One-click publishing to X (Twitter) and other platforms</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Get support from the pubdev team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📧 Email:</span>
                  <a href="mailto:support@pubdev.com" className="text-primary hover:underline">
                    support@pubdev.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📦 NPM Package:</span>
                  <a 
                    href="https://www.npmjs.com/package/pubdev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    npmjs.com/package/pubdev
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">🏠 Homepage:</span>
                  <Link href="/" className="text-primary hover:underline">
                    pubdev.app
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

