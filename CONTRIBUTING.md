# Contributing to pubdev

First off, thank you for considering contributing to pubdev! It's people like you that make pubdev such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed** and what behavior you expected
* **Include screenshots or animated GIFs** if applicable
* **Include your environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List any alternative solutions or features you've considered**

### Pull Requests

* Fill in the required template
* Follow the TypeScript/React style guide
* Include thoughtful commit messages
* Include tests when adding new features
* Document new code with JSDoc comments
* Update the README.md if needed
* End all files with a newline

## Development Process

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pubdev.git`
3. Create a branch: `git checkout -b my-feature-branch`
4. Make your changes
5. Run tests (if applicable)
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to your fork: `git push origin my-feature-branch`
8. Submit a pull request

### Setup Development Environment

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Set up Supabase:
   - Create a Supabase project
   - Run all SQL scripts in `/scripts` folder in order
   - Add your Supabase credentials to `.env.local`

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Visit `http://localhost:3000`

### Project Structure

```
pubdev/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/              # Utilities, auth, database clients
├── scripts/          # Database migration scripts
└── npm_package/      # NPM package for code scanning
```

### Code Style

We use:
- **TypeScript** for type safety
- **Functional components** and hooks
- **ESLint** for linting
- **Prettier** for code formatting (if configured)

Key conventions:
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Prefer interfaces over types
- Use functional and declarative programming patterns
- Avoid classes when possible

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Testing

Before submitting a pull request, make sure:
- Your code builds without errors: `pnpm build`
- All existing tests pass (if tests exist)
- You've added tests for new features
- You've tested manually in development environment

## Database Changes

If your contribution involves database changes:
1. Create a new SQL migration script in `/scripts` folder
2. Follow the naming convention: `XXX_description.sql`
3. Include both `UP` and `DOWN` migrations if possible
4. Test the migration on a fresh Supabase project
5. Document any RLS policy changes

## Documentation

* Update the README.md if you change functionality
* Add JSDoc comments to new functions and components
* Update type definitions when changing interfaces
* Include inline comments for complex logic

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

