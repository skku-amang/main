# Development Workflows

## Getting Started

### Prerequisites

```bash
# Required
- Node.js >= 18
- pnpm 10.13.1+
- PostgreSQL 14+

# Recommended
- VSCode with extensions:
  - Prisma
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/skku-amang/main.git
cd main

# 2. Install dependencies
pnpm install

# 3. Setup database
# Create PostgreSQL database named 'amang' (or your choice)
createdb amang

# 4. Configure environment variables
# Create .env file in packages/database
cat > packages/database/.env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/amang"
SEED_DEFAULT_PASSWORD="your-default-password"
EOF

# Create .env.local in apps/api
cat > apps/api/.env.local << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/amang"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
EOF

# Create .env.local in apps/web
cat > apps/web/.env.local << EOF
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
EOF

# 5. Run database migrations
pnpm --filter @repo/database db:deploy

# 6. Seed database
pnpm --filter @repo/database db:seed

# 7. Build all packages
pnpm build

# 8. Start development servers
pnpm dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Common Development Tasks

### Running the Application

```bash
# Start all apps in development mode
pnpm dev

# Start specific app only
pnpm --filter api dev
pnpm --filter web dev

# Start with specific port
PORT=3002 pnpm --filter api dev
```

### Database Operations

```bash
# Generate Prisma Client (after schema changes)
pnpm --filter @repo/database db:generate

# Create a new migration
cd packages/database
pnpm prisma migrate dev --name add_new_feature

# Apply migrations (production)
pnpm db:deploy

# Reset database (DESTRUCTIVE - development only)
cd packages/database
pnpm prisma migrate reset

# Seed database
pnpm --filter @repo/database db:seed

# Open Prisma Studio (database GUI)
cd packages/database
pnpm prisma studio
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Lint specific package
pnpm --filter api lint
pnpm --filter web lint

# Format code
pnpm format

# Type check
pnpm check-types

# Run all checks (pre-commit)
pnpm lint && pnpm check-types
```

### Testing

```bash
# Run all tests
pnpm test

# Run API tests
pnpm --filter api test

# Run API tests in watch mode
pnpm --filter api test:watch

# Run E2E tests
pnpm --filter api test:e2e

# Run tests with coverage
pnpm --filter api test:cov
```

### Building

```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter api build
pnpm --filter web build
pnpm --filter @repo/database build

# Clean build artifacts
pnpm turbo clean

# Build with cache disabled
pnpm turbo build --force
```

## Feature Development Workflow

### 1. Adding a New API Endpoint

**Example: Adding a "favorite team" feature**

#### Step 1: Update Database Schema

```prisma
// packages/database/prisma/schema.prisma

model User {
  // ... existing fields
  favoriteTeams FavoriteTeam[]
}

model FavoriteTeam {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  
  userId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  teamId Int
  team   Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@unique([userId, teamId])
  @@map("favorite_teams")
}

model Team {
  // ... existing fields
  favoritedBy FavoriteTeam[]
}
```

#### Step 2: Create Migration

```bash
cd packages/database
pnpm prisma migrate dev --name add_favorite_teams
```

#### Step 3: Create DTOs

```typescript
// apps/api/src/favorite/dto/add-favorite.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const addFavoriteSchema = z.object({
  teamId: z.number().int().positive(),
});

export class AddFavoriteDto extends createZodDto(addFavoriteSchema) {}
```

#### Step 4: Create Service

```typescript
// apps/api/src/favorite/favorite.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictError, NotFoundError } from '@repo/api-client';

@Injectable()
export class FavoriteService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: number, teamId: number) {
    try {
      const favorite = await this.prisma.favoriteTeam.create({
        data: { userId, teamId },
        include: { team: true },
      });
      return favorite;
    } catch (error) {
      // Handle duplicate favorites
      if (error.code === 'P2002') {
        throw new ConflictError('Already favorited');
      }
      throw error;
    }
  }

  async removeFavorite(userId: number, teamId: number) {
    const favorite = await this.prisma.favoriteTeam.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    
    if (!favorite) {
      throw new NotFoundError('Favorite not found');
    }
    
    await this.prisma.favoriteTeam.delete({
      where: { id: favorite.id },
    });
  }

  async getFavorites(userId: number) {
    return this.prisma.favoriteTeam.findMany({
      where: { userId },
      include: { team: true },
    });
  }
}
```

#### Step 5: Create Controller

```typescript
// apps/api/src/favorite/favorite.controller.ts
import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { Request } from 'express';

@Controller('favorites')
@UseGuards(AccessTokenGuard)
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Post(':teamId')
  addFavorite(@Param('teamId') teamId: number, @Req() req: Request) {
    const userId = req.user.sub;
    return this.favoriteService.addFavorite(userId, teamId);
  }

  @Delete(':teamId')
  removeFavorite(@Param('teamId') teamId: number, @Req() req: Request) {
    const userId = req.user.sub;
    return this.favoriteService.removeFavorite(userId, teamId);
  }

  @Get()
  getFavorites(@Req() req: Request) {
    const userId = req.user.sub;
    return this.favoriteService.getFavorites(userId);
  }
}
```

#### Step 6: Create Module

```typescript
// apps/api/src/favorite/favorite.module.ts
import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';

@Module({
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
```

#### Step 7: Register in App Module

```typescript
// apps/api/src/app.module.ts
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    // ... other modules
    FavoriteModule,
  ],
})
export class AppModule {}
```

#### Step 8: Test

```bash
# Start API
pnpm --filter api dev

# Test with curl
curl -X POST http://localhost:3001/favorites/1 \
  -H "Cookie: accessToken=YOUR_TOKEN"

curl http://localhost:3001/favorites \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

### 2. Adding a Frontend Feature

**Example: Display favorite teams**

#### Step 1: Create API Hook

```typescript
// apps/web/hooks/api/useFavorites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => fetch('/api/favorites').then(r => r.json()),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: number) => 
      fetch(`/api/favorites/${teamId}`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamId: number) => 
      fetch(`/api/favorites/${teamId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
```

#### Step 2: Create Component

```typescript
// apps/web/components/features/favorites/favorite-button.tsx
'use client';

import { Button } from '@repo/ui';
import { useAddFavorite, useRemoveFavorite } from '@/hooks/api/useFavorites';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  teamId: number;
  isFavorited: boolean;
}

export function FavoriteButton({ teamId, isFavorited }: FavoriteButtonProps) {
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleClick = () => {
    if (isFavorited) {
      removeFavorite.mutate(teamId);
    } else {
      addFavorite.mutate(teamId);
    }
  };

  return (
    <Button
      variant={isFavorited ? 'default' : 'outline'}
      onClick={handleClick}
      disabled={addFavorite.isPending || removeFavorite.isPending}
    >
      <Heart className={isFavorited ? 'fill-current' : ''} />
      {isFavorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
```

#### Step 3: Use in Page

```typescript
// apps/web/app/(general)/teams/[id]/page.tsx
import { FavoriteButton } from '@/components/features/favorites/favorite-button';

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = await fetchTeam(params.id);
  
  return (
    <div>
      <h1>{team.name}</h1>
      <FavoriteButton teamId={team.id} isFavorited={team.isFavorited} />
      {/* rest of team details */}
    </div>
  );
}
```

### 3. Adding a Shared UI Component

```typescript
// packages/ui/src/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Export from index
// packages/ui/src/index.ts
export { Badge } from './badge';
```

## Git Workflow

### Branch Strategy

```
main (production)
  ↓
develop (development)
  ↓
feature/add-favorites (feature branches)
bugfix/fix-application-race (bug fixes)
hotfix/security-patch (urgent fixes)
```

### Commit Messages

Follow conventional commits:

```
feat: add favorite teams feature
fix: resolve race condition in team applications
docs: update API documentation
chore: upgrade dependencies
test: add tests for team service
refactor: simplify team application logic
style: format code with prettier
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes
3. Write/update tests
4. Run linters and tests locally
5. Push to GitHub
6. Create PR to `develop`
7. Wait for CI checks
8. Request review
9. Address feedback
10. Merge when approved

### Pre-commit Hooks

Husky runs automatically on commit:

```bash
# .husky/pre-commit
pnpm lint-staged
```

Lint-staged checks:
- ESLint on `.ts`, `.tsx` files
- Prettier format check
- TypeScript compilation

## Debugging

### Backend Debugging

```bash
# Start in debug mode
pnpm --filter api start:debug

# In VSCode, attach debugger:
# Run > Start Debugging (F5)
```

VSCode launch.json:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229,
  "restart": true,
  "sourceMaps": true,
  "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"]
}
```

### Frontend Debugging

```bash
# Start Next.js with debugging
NODE_OPTIONS='--inspect' pnpm --filter web dev

# Chrome DevTools
# Navigate to chrome://inspect
```

### Database Debugging

```bash
# Open Prisma Studio
cd packages/database
pnpm prisma studio

# View SQL queries
# Add to apps/api/src/prisma/prisma.service.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Network Debugging

```bash
# View API requests in browser DevTools
# Network tab > Filter by XHR/Fetch

# Use TanStack Query DevTools
# Automatically enabled in development
```

## Troubleshooting

### Issue: Prisma Client not found

```bash
pnpm --filter @repo/database db:generate
pnpm build
```

### Issue: Database connection error

```bash
# Check PostgreSQL is running
psql -l

# Check DATABASE_URL in .env files
cat packages/database/.env
cat apps/api/.env.local

# Test connection
psql $DATABASE_URL
```

### Issue: Port already in use

```bash
# Find process using port
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)

# Or use different port
PORT=3002 pnpm --filter api dev
```

### Issue: Module not found

```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Rebuild
pnpm turbo clean
pnpm build
```

### Issue: Type errors after schema change

```bash
# Regenerate everything
pnpm --filter @repo/database db:generate
pnpm --filter @repo/shared-types build
pnpm --filter @repo/database build
pnpm check-types
```

### Issue: Turbo cache stale

```bash
# Clear Turbo cache
pnpm turbo clean

# Force rebuild
pnpm turbo build --force
```

## Performance Profiling

### Backend Profiling

```typescript
// Add timing to service methods
async findAll() {
  const start = Date.now();
  const result = await this.prisma.team.findMany(...);
  console.log(`findAll took ${Date.now() - start}ms`);
  return result;
}
```

### Frontend Profiling

```bash
# Build with profiling
NODE_ENV=production pnpm --filter web build

# Analyze bundle
pnpm --filter web analyze
```

React DevTools Profiler:
1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Interact with app
5. Stop recording
6. Review render times

## Production Deployment

### Build for Production

```bash
# Build all packages
pnpm build

# Test production build locally
pnpm --filter api start:prod
pnpm --filter web start
```

### Environment Variables

Production `.env` files need:

```bash
# API
DATABASE_URL="production-database-url"
JWT_ACCESS_SECRET="strong-random-secret"
JWT_REFRESH_SECRET="different-strong-secret"
NODE_ENV="production"

# Web
NEXTAUTH_SECRET="strong-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### Database Migration

```bash
# On production server
pnpm --filter @repo/database db:deploy

# Never run migrate dev in production!
```

---

This workflow ensures consistent development practices and smooth collaboration across the team.
