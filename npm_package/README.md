# pubdev

Automatic social media content generation for your code releases. Install once, works forever—just like Sentry.

## Features

- 🤖 **Automatic Detection**: Scans your codebase for new features and changes
- 📝 **AI-Powered Content**: Generates engaging social media posts with GPT-5
- 🖼️ **Image Generation**: Optional image generation with Gemini 2.5 Flash
- 🔄 **CI/CD Integration**: Works seamlessly with GitHub Actions, Vercel, and more
- ⚡ **Zero Configuration**: Works out of the box with sensible defaults
- 🔒 **Secure**: API key authentication and encrypted communication

## Installation

```bash
npm install -D pubdev
# or
pnpm add -D pubdev
# or
yarn add -D pubdev
```

## Quick Start

### 1. Get Your API Key

Visit [pubdev.app](https://pubdev.app) to:
- Create an account
- Create a project
- Generate an API key

### 2. Initialize in Your Project

```bash
npx pubdev init
```

Follow the interactive prompts:
```
? Enter your pubdev API key: sk_***
? Project ID: my-awesome-app
? Scan paths (comma separated): src/components,src/pages  (or app,components,lib for Next.js)
? Run on build? Yes
✓ Configuration saved!
```

This creates `pubdev.config.js`:
```javascript
module.exports = {
  apiKey: process.env.pubdev_API_KEY,
  projectId: "my-awesome-app",
  scan: {
    // For React apps (CRA, Vite):
    paths: ["src/components", "src/pages", "src/features"],
    
    // For Next.js App Router (no src):
    // paths: ["app", "components", "lib"],
    
    // For Next.js with src directory:
    // paths: ["src/app", "src/components", "src/lib"],
    
    ignore: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx"],
  },
  triggers: {
    onBuild: true,
    onCommit: false,
    onPush: false,
  },
}
```

### 3. That's It!

Now pubdev will automatically:
1. Detect when you build/deploy
2. Scan your components for changes
3. Generate content with AI
4. Create draft posts in your dashboard

## Usage

### Automatic Scanning

Once configured, pubdev runs automatically on:
- **Build time**: `npm run build` (if `triggers.onBuild` is enabled)
- **Git commits**: After each commit (if `triggers.onCommit` is enabled)
- **CI/CD**: Automatically detects CI environments

### Manual Scanning

```bash
# Scan now
npx pubdev scan

# Scan specific files (Next.js)
npx pubdev scan app/dashboard/page.tsx
npx pubdev scan components/NewFeature.tsx

# Scan specific files (React)
npx pubdev scan src/components/NewFeature.tsx
npx pubdev scan src/pages/Dashboard.tsx

# Scan changes since a specific commit
npx pubdev scan --since HEAD~5

# Quiet mode (minimal output)
npx pubdev scan --quiet
```

## Configuration

### Config File Options

```javascript
module.exports = {
  // Required
  apiKey: string,              // Your pubdev API key
  projectId: string,           // Your project ID

  // Optional
  scan: {
    paths: string[],           // Paths to scan (see examples below)
    ignore: string[],          // Patterns to ignore (default: ["**/*.test.*", "**/*.stories.*"])
  },
  
  triggers: {
    onBuild: boolean,          // Run on build (default: true)
    onCommit: boolean,         // Run on git commit (default: false)
    onPush: boolean,           // Run on git push (default: false)
  },
}
```

### Path Examples by Project Type

**React Apps (Create React App, Vite, etc.):**
```javascript
scan: {
  paths: ["src/components", "src/pages", "src/features"],
  // React apps typically use src/ directory
}
```

**Next.js 13+ App Router (no src directory):**
```javascript
scan: {
  paths: ["app", "components", "lib"],
  // Modern Next.js default structure
}
```

**Next.js 13+ App Router (with src directory):**
```javascript
scan: {
  paths: ["src/app", "src/components", "src/lib"],
}
```

**Next.js Pages Router (no src directory):**
```javascript
scan: {
  paths: ["pages", "components", "lib"],
}
```

**Next.js Pages Router (with src directory):**
```javascript
scan: {
  paths: ["src/pages", "src/components", "src/lib"],
}
```

**Monorepo (scan specific packages):**
```javascript
scan: {
  paths: ["packages/web/app", "packages/web/components", "packages/ui/src"],
}
```

### Environment Variables

Store your API key securely:

```bash
# .env or .env.local
pubdev_API_KEY=sk_your_key_here
```

Then in `pubdev.config.js`:
```javascript
module.exports = {
  apiKey: process.env.pubdev_API_KEY,
  // ...
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy
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
          pubdev_API_KEY: ${{ secrets.pubdev_API_KEY }}
```

### Vercel

Add to your project settings:
```json
{
  "buildCommand": "npm run build && npx pubdev scan"
}
```

Or add to `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "pubdev scan"
  }
}
```

### Netlify

Update `netlify.toml`:
```toml
[build]
  command = "npm run build && npx pubdev scan"
  publish = "dist"

[build.environment]
  pubdev_API_KEY = "${pubdev_API_KEY}"
```

## How It Works

1. **Scan**: pubdev analyzes your Git history and code changes
2. **Detect**: Identifies new/modified React components, pages, and features
3. **Parse**: Extracts component names, descriptions, and context
4. **Generate**: AI creates engaging social media posts with your branding
5. **Review**: You review and edit generated content in the dashboard
6. **Publish**: One-click publishing to X (Twitter) and other platforms

## Programmatic API

You can also use pubdev programmatically:

```typescript
import { scan, loadConfig } from 'pubdev'

async function customScan() {
  const result = await scan()
  console.log('Scan ID:', result.scanId)
  console.log('Draft URL:', result.draftUrl)
}
```

## What Gets Scanned?

pubdev automatically detects:

- **React Components**: Function and class components
- **Pages**: Next.js pages and app router routes
- **API Routes**: API endpoints and server functions
- **Features**: Any significant code changes

It extracts:
- Component/feature names
- JSDoc comments
- File context
- Git commit information

## Privacy & Security

- ✅ **No Source Code Storage**: Only metadata and descriptions are sent
- ✅ **Encrypted Communication**: All data transmitted over HTTPS
- ✅ **API Key Authentication**: Secure key-based access
- ✅ **User Control**: You choose what to scan and publish

## Troubleshooting

### "No configuration found"

Run `npx pubdev init` to create a config file.

### "Not a git repository"

pubdev requires Git for change detection. Initialize git:
```bash
git init
git add .
git commit -m "Initial commit"
```

### "Invalid API key"

Check that:
1. Your API key is correct in `pubdev.config.js`
2. The API key hasn't expired
3. Your project ID is correct

### "No changes detected"

Make sure:
1. You have committed changes
2. Scan paths include your changed files
3. Files aren't ignored by the config

## Support

- 📧 Email: support@pubdev.com
- 📚 Docs: https://docs.pubdev.com
- 💬 Discord: https://discord.gg/pubdev
- 🐛 Issues: https://github.com/pubdev/pubdev/issues

## License

MIT

---

Made with ❤️ by the pubdev team

