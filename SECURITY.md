# Security Policy

## Supported Versions

We currently support the latest minor release with security updates.

## Reporting a Vulnerability

Please report security vulnerabilities privately to security@pubdev.app. We will
acknowledge your report within 72 hours and provide an estimated timeline for
fixes. Do not disclose vulnerabilities publicly until we have released a fix.

## Scope

This policy covers the open-source repository, including:

- Next.js app (`/app`, `/lib`, `/components`)
- API routes and server code
- Database SQL scripts (`/scripts`)
- NPM package under `/npm_package`

Out of scope: hosted production infrastructure and third-party services.

## Best Practices for Contributors

- Avoid committing secrets or credentials
- Respect Row Level Security (RLS) when modifying SQL scripts
- Use parameterized queries and input validation
- Validate user sessions server-side (SSR) for protected routes
- Follow principle of least privilege for service keys

## Coordinated Disclosure

We follow a coordinated disclosure process. If you report a vulnerability, we
will keep you updated on the fix status and credit you in the release notes if
desired.


