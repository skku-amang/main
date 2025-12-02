# AMANG Performance Management System

A comprehensive web application for managing music performances at Sungkyunkwan University's AMANG music club.

## 🎵 About

AMANG is a music performance club at SKKU where students collaborate to form bands and perform at concerts. This system manages:
- Performance events (concerts)
- Team formation and recruitment
- Member applications and session coordination
- Role-based access control

## 🤖 AI Documentation

**Working with AI assistants on this project?** Check out our comprehensive AI documentation:

- **[`.cursorrules`](./.cursorrules)** - Quick reference guide for AI assistants
- **[`.ai/`](./.ai/)** - Detailed documentation including:
  - [Project Overview](./.ai/project-overview.md) - Business domain and concepts
  - [Architecture](./.ai/architecture.md) - System structure and design
  - [Workflows](./.ai/workflows.md) - Development processes and tasks

These documents help AI assistants understand the codebase and generate better, context-aware code.

## 📦 What's inside?

This monorepo includes the following packages and apps:

### Apps

- **`api`**: NestJS backend application with REST API
- **`web`**: Next.js 14 frontend application with App Router

### Packages

- **`@repo/ui`**: Shared React component library (shadcn/ui based)
- **`@repo/shared-types`**: TypeScript type definitions shared across apps
- **`@repo/database`**: Prisma schema, client, and database utilities
- **`@repo/api-client`**: HTTP client and error handling
- **`@repo/eslint-config`**: Shared ESLint and Prettier configurations
- **`@repo/typescript-config`**: Shared TypeScript configurations

### Tech Stack

- **TypeScript** for type safety across the entire stack
- **Turborepo** for monorepo management
- **pnpm** for package management
- **NestJS** for structured backend architecture
- **Next.js 14** for modern React development
- **Prisma** for type-safe database access
- **PostgreSQL** for data persistence
- **TanStack Query** for data fetching and caching
- **Tailwind CSS** for styling

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 10.13.1+
- PostgreSQL 14+

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
# Create a PostgreSQL database and configure DATABASE_URL in .env files

# Run migrations
pnpm --filter @repo/database db:deploy

# Seed database
pnpm --filter @repo/database db:seed

# Build all packages
pnpm build
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start specific app only
pnpm --filter api dev
pnpm --filter web dev

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
```

### Common Commands

```bash
# Build
pnpm build

# Lint
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format

# Run tests
pnpm --filter api test

# Database operations
pnpm --filter @repo/database db:generate  # Generate Prisma client
pnpm --filter @repo/database db:migrate   # Create migration
pnpm db:deploy                            # Apply migrations
```

## 📚 Documentation

- **[Getting Started Guide](./.ai/workflows.md)** - Detailed setup and development workflow
- **[Architecture Documentation](./.ai/architecture.md)** - System design and structure
- **[Project Overview](./.ai/project-overview.md)** - Business domain and concepts
- **[API Documentation](./apps/api/)** - Backend API reference
- **[Database Schema](./packages/database/prisma/schema.prisma)** - Data model

## 🏗️ Project Status

### Completed ✅
- Database schema and migrations
- User authentication (JWT-based)
- Team API with CRUD operations
- Application/unapplication workflow
- Performance, Generation, and Session APIs

### In Progress 🚧
- Frontend integration with API
- Team management UI
- Admin dashboard
- Performance calendar view

## 🤝 Contributing

1. Check the [Development Workflows](./.ai/workflows.md)
2. Follow the coding standards in [.cursorrules](./.cursorrules)
3. Write tests for new features
4. Ensure all checks pass before submitting PR

## 📄 License

[Add license information here]

## 🔗 Links

- [Turborepo Documentation](https://turborepo.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
