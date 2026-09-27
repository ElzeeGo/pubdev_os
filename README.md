# pubdev

**Automatic social media content generation for your code releases.**

Install once in your codebase, and let AI generate engaging social media posts about your new features—automatically.

## 🚀 Features

- **Full-Stack App**: Next.js app with Supabase backend for managing projects and publishing
- **NPM Package**: Install `pubdev` in any codebase to enable automatic content generation
- **AI-Powered**: Uses GPT-5 for text generation and Gemini 2.5 Flash for image generation
- **Video Generation**: Generate promotional videos with ElevenLabs (Seedance 2.5 by default, MiniMax H3 Max as the faster option)
- **Manual Generation**: Manually create and edit text, images, and videos from the dashboard (besides auto-generation)
- **X (Twitter) Integration**: OAuth 1.0a and 2.0 support for posting tweets with media
- **Sentry-Style**: Simple install → init → it just works

## 📦 Architecture

This is a monorepo containing:

### 1. Hosted Service (`/app`)
Next.js application where users:
- Sign up and create projects
- Generate API keys
- Review and edit AI-generated content
- Publish to X (Twitter)
- View analytics and history

### 2. NPM Package (`/packages/pubdev`)
CLI tool and SDK that users install in their codebases:
- Scans code for changes via Git
- Detects new React components and features
- Sends data to hosted service
- Runs automatically on build/deploy

## 🎯 User Flow

### For End Users

1. **Sign up** at `pubdev.app`
2. **Create project** and get API key
3. **Install package** in their codebase:
   ```bash
   npm install -D pubdev
   npx pubdev init
   ```
4. **Automatic scanning**: When they build/deploy, the package:
   - Detects changes via Git
   - Analyzes new/modified components
   - Sends data to pubdev service
5. **Review & publish**: Visit dashboard to review AI-generated posts and publish

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- OpenAI API key (for GPT-5)
- Google AI API key (for Gemini)
- X (Twitter) Developer account

### Setup

1. **Clone and install**:
   ```bash
   git clone <repo>
   cd pubdev
   pnpm install
   ```

2. **Set up Supabase**:
   - Create a Supabase project
   - Run all SQL scripts in `/scripts` folder in order:
     ```bash
     001_create_tables.sql
     002_enable_rls.sql
     003_create_triggers.sql
     004_create_functions.sql
     005_oauth_state.sql
     006_user_settings.sql
     007_oauth1a_support.sql
     008_performance_indexes.sql
     009_rls_optimization_notes.sql
     010_api_keys_and_scans.sql
     ```

3. **Environment variables**:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   # Then edit .env.local with your actual values
   ```

4. **Configure pubdev package** (optional, for testing self-scan):
   Copy `pubdev.config.example.js` to `pubdev.config.js` and add your API key:
   ```bash
   cp pubdev.config.example.js pubdev.config.js
   # Then edit pubdev.config.js with your project API key
   ```
   
   > ⚠️ **Security Note**: `pubdev.config.js` is in `.gitignore` and should never be committed!

5. **Run development**:
   ```bash
   # Run main app
   pnpm dev
   
   # Build package
   cd packages/pubdev
   pnpm build
   
   # Test package locally
   pnpm link
   cd /path/to/test/project
   pnpm link pubdev
   ```

### Database Schema

Key tables:
- `users`: User accounts
- `organizations`: Teams/workspaces
- `projects`: User projects
- `api_keys`: API keys for package authentication
- `scans`: Automated scan submissions from package
- `drafts`: AI-generated content drafts
- `posts`: Published posts to social media
- `identities`: OAuth connections (X, etc.)

## 📄 Project Structure

```
pubdev/
├── app/                          # Next.js hosted service
│   ├── api/
│   │   ├── v1/
│   │   │   ├── scan/            # Receives scan data from package
│   │   │   └── keys/            # API key management
│   │   ├── oauth/               # Social media OAuth
│   │   ├── drafts/              # Content management
│   │   └── publish/             # Publishing endpoints
│   ├── dashboard/               # User dashboard
│   ├── projects/                # Project management
│   └── settings/                # User settings
│
├── packages/
│   └── pubdev/                 # NPM package
│       ├── src/
│       │   ├── cli/             # CLI commands (init, scan)
│       │   ├── scanner/         # Git & code scanning
│       │   ├── client/          # API client
│       │   └── index.ts         # Programmatic API
│       └── package.json
│
├── components/                  # Shared React components
├── lib/                        # Shared utilities
│   ├── auth.ts                 # Authentication
│   ├── supabase/               # Supabase clients
│   ├── oauth/                  # OAuth integrations
│   └── llm/                    # AI content generation
│
└── scripts/                    # Database migrations
```

## 🚢 Deployment

### Main App

#### Option 1: Hetzner VPS (Recommended for Self-Hosting)

Complete deployment guide for Hetzner VPS with Supabase:

📖 **[DEPLOYMENT_README.md](./DEPLOYMENT_README.md)** - Start here for VPS deployment

Additional resources:
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md) - Step-by-step instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Track your progress
- [Quick Reference](./QUICK_REFERENCE.md) - Common commands and troubleshooting

**Quick Deploy:**
```bash
# After initial setup, deploy updates with:
./deploy.sh
```

**Tech Stack:**
- Nginx (reverse proxy)
- PM2 (process manager, cluster mode)
- Let's Encrypt (SSL)
- Supabase (cloud database)

#### Option 2: Vercel

Deploy to Vercel:
```bash
vercel deploy
```

Set all environment variables in Vercel dashboard.

### NPM Package

Publish to npm:
```bash
cd packages/pubdev
pnpm build
npm publish
```

## 📚 Documentation

### Development
- [Package Architecture](./PACKAGE_ARCHITECTURE.md) - Detailed architecture overview
- [Migration Guide](./MIGRATION_GUIDE.md) - Prisma to Supabase migration
- [OAuth Setup](./OAUTH1A_MEDIA_SETUP.md) - X OAuth configuration
- [Loader Integration](./LOADER_INTEGRATION.md) - Loading states documentation

### Deployment (Hetzner VPS)
- [**Deployment Overview**](./DEPLOYMENT_README.md) - Start here for VPS deployment
- [SSH Key Setup](./SSH_KEY_SETUP.md) - Generate and add SSH keys to Hetzner
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete step-by-step guide
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Track your progress
- [Quick Reference](./QUICK_REFERENCE.md) - Common commands and troubleshooting

## 🤝 Contributing

We welcome contributions! Please read the following before getting started:

- See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines, setup, and process
- Review our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security issues? Please follow [SECURITY.md](./SECURITY.md)

Quick start:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (`pnpm build`)
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [Google AI](https://ai.google.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
