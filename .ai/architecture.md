# Architecture Deep Dive

## System Architecture Overview

The AMANG Performance Management System uses a modern, full-stack TypeScript architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Next.js 14 (App Router)                       │ │
│  │  - React 18.3 Server/Client Components                │ │
│  │  - TanStack Query (State Management)                  │ │
│  │  - NextAuth.js (Client-side Auth)                     │ │
│  │  - Tailwind CSS + shadcn/ui                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             NestJS Application                         │ │
│  │  - Controllers (HTTP Endpoints)                        │ │
│  │  - Guards (JWT Auth, Role-based)                      │ │
│  │  - DTOs (Validation with Zod)                         │ │
│  │  - Services (Business Logic)                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ Prisma Client
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           PostgreSQL Database                          │ │
│  │  - Relational data model                              │ │
│  │  - Foreign keys & constraints                         │ │
│  │  - Indexes for performance                            │ │
│  │  - Migrations managed by Prisma                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

### Why Turborepo?

Turborepo provides several key benefits for our multi-package architecture:

1. **Task Pipeline**: Dependencies between tasks are automatically resolved
2. **Remote Caching**: Build artifacts can be shared across machines
3. **Parallel Execution**: Independent tasks run simultaneously
4. **Incremental Builds**: Only changed packages are rebuilt

### Package Dependency Graph

```
apps/web
  ├─→ @repo/api-client
  ├─→ @repo/shared-types
  ├─→ @repo/database (types only)
  └─→ @repo/ui

apps/api
  ├─→ @repo/api-client (error types)
  ├─→ @repo/shared-types
  └─→ @repo/database

@repo/shared-types
  └─→ @repo/database

@repo/database
  └─→ (no dependencies, foundational)

@repo/ui
  └─→ (no dependencies, pure React)
```

### Build Order

Thanks to Turborepo's dependency graph:

1. **@repo/database** - Generates Prisma client
2. **@repo/shared-types** - Builds type definitions
3. **@repo/ui** - Compiles React components
4. **@repo/api-client** - Builds HTTP client
5. **apps/api** - Compiles NestJS application
6. **apps/web** - Builds Next.js application

## Backend Architecture (NestJS)

### Module Organization

```
app.module.ts (Root)
├── AuthModule
│   ├── JwtStrategy
│   ├── RefreshTokenStrategy
│   ├── AccessTokenGuard
│   └── RefreshTokenGuard
├── UsersModule
│   ├── UsersController
│   ├── UsersService
│   └── DTOs
├── TeamModule
│   ├── TeamController
│   ├── TeamService
│   ├── TeamOwnerGuard
│   └── DTOs
├── PerformanceModule
├── GenerationModule
├── SessionModule
└── PrismaModule (Global)
    └── PrismaService
```

### Request Flow

```
1. HTTP Request
   ↓
2. Global Exception Filter
   ↓
3. Validation Pipe (Zod DTOs)
   ↓
4. Guards (Authentication & Authorization)
   ↓
5. Controller (Route Handler)
   ↓
6. Service (Business Logic)
   ↓
7. Prisma Service (Database)
   ↓
8. Response or Error
```

### Authentication Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /auth/login
       │ { email, password }
       ↓
┌──────────────────┐
│ AuthController   │
└──────┬───────────┘
       │ validate credentials
       ↓
┌──────────────────┐
│  AuthService     │
│ - verify password│
│ - generate tokens│
└──────┬───────────┘
       │ JWT Access Token (15m)
       │ JWT Refresh Token (7d, hashed in DB)
       ↓
┌──────────────────┐
│   Set Cookies    │
│ - accessToken    │
│ - refreshToken   │
└──────┬───────────┘
       │
       ↓
┌─────────────┐
│ Subsequent  │
│ Requests    │
│ with cookies│
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ AccessTokenGuard │
│ - verify JWT     │
│ - attach user    │
└──────────────────┘
```

### Error Handling Strategy

Custom error classes map to HTTP status codes:

```typescript
NotFoundError          → 404
ValidationError        → 400
ConflictError          → 409
ForbiddenError         → 403
UnauthorizedError      → 401

Domain-specific errors:
DuplicateApplicationError    → 409
PositionOccupiedError        → 409
SessionNotFoundError         → 404
NoApplicationFoundError      → 404
InvalidMemberIndexError      → 400
DuplicateMemberIndexError    → 400
DuplicateSessionUserError    → 400
DuplicateTeamSessionError    → 409
ReferencedEntityNotFoundError → 404
```

### Database Transaction Pattern

For operations that modify multiple entities:

```typescript
async update(id: number, dto: UpdateDto) {
  const operations: Prisma.PrismaPromise<any>[] = [];
  
  // Collect all operations
  operations.push(this.prisma.entity1.update(...));
  operations.push(this.prisma.entity2.create(...));
  operations.push(this.prisma.entity3.delete(...));
  
  try {
    // Execute atomically
    await this.prisma.$transaction(operations);
    return this.findOne(id);
  } catch (error) {
    // Handle Prisma errors
    throw new DomainError(...);
  }
}
```

## Frontend Architecture (Next.js)

### App Router Structure

```
app/
├── layout.tsx                  # Root layout with providers
├── (home)/                     # Home route group
│   └── page.tsx
├── (general)/                  # General pages route group
│   ├── teams/
│   │   ├── page.tsx           # Team list
│   │   └── [id]/
│   │       └── page.tsx       # Team detail
│   ├── performances/
│   └── profile/
├── _(errors)/                  # Error pages
│   ├── not-found.tsx
│   └── error.tsx
├── login/                      # Auth pages
│   └── page.tsx
└── api/                        # API routes (NextAuth)
    └── auth/
        └── [...nextauth]/
            └── route.ts
```

### Data Fetching Strategy

**Server Components** (Default):
- Fetch data server-side
- No JavaScript sent to client
- SEO-friendly
- Direct database/API access

**Client Components** (with TanStack Query):
- Interactive UI elements
- Real-time updates
- Optimistic updates
- Caching and refetching

```typescript
// Server Component (app/teams/page.tsx)
export default async function TeamsPage() {
  const teams = await fetchTeams(); // Server-side fetch
  return <TeamList teams={teams} />;
}

// Client Component (components/team-list.tsx)
'use client';
export function TeamList({ teams: initialTeams }) {
  const { data: teams } = useTeams({
    initialData: initialTeams // Hydrate from server
  });
  return <div>{teams.map(...)}</div>;
}
```

### State Management

**Server State** (TanStack Query):
- API responses
- Database-driven data
- Cached with automatic revalidation

**Client State** (React hooks):
- Form state (React Hook Form)
- UI state (modals, dropdowns)
- Local preferences

**Auth State** (NextAuth):
- User session
- Auth tokens
- Middleware protection

### Component Architecture

```
components/
├── ui/                    # Basic UI primitives (buttons, inputs)
│   ├── button.tsx        # From shadcn/ui
│   ├── input.tsx
│   └── ...
├── features/             # Feature-specific components
│   ├── teams/
│   │   ├── team-card.tsx
│   │   ├── team-form.tsx
│   │   └── team-application.tsx
│   └── performances/
└── layout/               # Layout components
    ├── header.tsx
    ├── footer.tsx
    └── nav.tsx
```

## Database Architecture (Prisma + PostgreSQL)

### Schema Design Principles

1. **Referential Integrity**: Foreign keys enforce relationships
2. **Cascading Deletes**: Automatic cleanup of dependent records
3. **Unique Constraints**: Prevent duplicates at DB level
4. **Nullable Leaders**: Allow optional leadership roles
5. **Timestamps**: Track creation and updates

### Key Relationships

```
User 1────N Generation (belongsTo)
User 1────1 Generation (leader, optional)
User 1────1 Session (belongsTo, optional)
User 1────1 Session (leader, optional)
User 1────N Team (leadingTeams)
User 1────N TeamMember (applications)

Performance 1────N Team (cascade delete)

Team 1────1 Performance (restrict delete)
Team 1────1 User (leader, restrict delete)
Team 1────N TeamSession (cascade delete)

TeamSession N────1 Team (cascade delete)
TeamSession N────1 Session (restrict delete)
TeamSession 1────N TeamMember (cascade delete)

TeamMember N────1 TeamSession (cascade delete)
TeamMember N────1 User (cascade delete)
```

### Index Strategy

Automatic indexes on:
- Primary keys (id)
- Unique constraints (email, nickname)
- Foreign keys (generationId, sessionId, etc.)

Future optimization indexes:
```sql
CREATE INDEX idx_teams_performance ON teams(performanceId);
CREATE INDEX idx_team_sessions_session ON team_sessions(sessionId);
CREATE INDEX idx_team_members_user ON team_members(userId);
```

### Migration Strategy

1. **Development**: `pnpm prisma migrate dev --name description`
   - Creates migration file
   - Applies to local database
   - Regenerates Prisma Client

2. **Production**: `pnpm prisma migrate deploy`
   - Applies pending migrations
   - No prompt, automated
   - Used in CI/CD

3. **Rollback**: Manual process
   - Migrations are sequential
   - Must create new "down" migration
   - Or restore database backup

## Shared Package Architecture

### @repo/database

**Purpose**: Single source of truth for data model

**Exports**:
- Prisma Client (generated)
- PrismaClient instance
- Prisma types (User, Team, etc.)

**Usage**:
```typescript
import { PrismaClient, User } from '@repo/database';
const prisma = new PrismaClient();
```

### @repo/shared-types

**Purpose**: Types shared between frontend and backend

**Contents**:
- API response types
- JWT payload types
- Enum definitions
- Utility types

**Usage**:
```typescript
import { JwtPayload, PublicUser } from '@repo/shared-types';
```

### @repo/api-client

**Purpose**: HTTP client and error handling

**Exports**:
- Error classes (NotFoundError, etc.)
- API client utilities
- Request/response types

**Usage in Backend**:
```typescript
import { NotFoundError } from '@repo/api-client';
throw new NotFoundError('Team not found');
```

**Usage in Frontend**:
```typescript
import { apiClient } from '@repo/api-client';
const teams = await apiClient.get('/teams');
```

### @repo/ui

**Purpose**: Reusable UI components

**Contents**:
- Button, Input, Card primitives
- Complex components (Calendar, DataTable)
- Styled with Tailwind CSS

**Usage**:
```typescript
import { Button, Card } from '@repo/ui';
```

## Security Architecture

### Authentication Layers

1. **Password Security**
   - bcrypt with 10 rounds
   - Never stored or transmitted plain
   - Compared securely with timing-safe functions

2. **JWT Tokens**
   - Access Token: Short-lived (15 minutes)
   - Refresh Token: Long-lived (7 days)
   - Signed with secret key
   - Verified on each request

3. **Token Storage**
   - HTTP-only cookies (XSS protection)
   - Secure flag in production (HTTPS only)
   - SameSite=Strict (CSRF protection)

4. **Refresh Token Security**
   - Hashed before database storage
   - One-time use (rotated on refresh)
   - Invalidated on logout

### Authorization Layers

1. **Route Guards**
   - `@Public()`: Skip auth check
   - `AccessTokenGuard`: Require valid token
   - `RefreshTokenGuard`: Require valid refresh token

2. **Resource Guards**
   - `TeamOwnerGuard`: Verify team ownership
   - Custom guards for other resources

3. **Role-Based Access**
   - `isAdmin` flag on User model
   - Admin-only endpoints
   - Future: granular permissions

### Input Validation

**Multiple Layers**:
1. Frontend validation (React Hook Form + Zod)
2. API validation (NestJS + Zod DTOs)
3. Database constraints (Prisma schema)

**Zod Schema Example**:
```typescript
export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  leaderId: z.number().int().positive(),
  performanceId: z.number().int().positive(),
  memberSessions: z.array(
    z.object({
      sessionId: z.number().int().positive(),
      capacity: z.number().int().positive(),
      members: z.array(...)
    })
  )
});
```

## Performance Considerations

### Backend Optimizations

1. **Selective Field Loading**
   ```typescript
   const basicUser = {
     id: true,
     name: true,
     nickname: true,
     image: true
   };
   ```

2. **Query Optimization**
   - Use `include` for relations
   - Use `select` to limit fields
   - Avoid N+1 queries

3. **Caching**
   - Turborepo caches build artifacts
   - Future: Redis for API responses

### Frontend Optimizations

1. **TanStack Query Caching**
   - Automatic background refetching
   - Stale-while-revalidate
   - Optimistic updates

2. **Next.js Optimizations**
   - Server Components (no JS overhead)
   - Automatic code splitting
   - Image optimization
   - Font optimization

3. **Bundle Size**
   - Tree-shaking unused code
   - Dynamic imports for large components
   - Shared packages reduce duplication

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────┐
│  Local Machine                      │
│  ├─ apps/api (port 3001)           │
│  ├─ apps/web (port 3000)           │
│  └─ PostgreSQL (port 5432)         │
└─────────────────────────────────────┘
```

### Production Environment (Future)

```
┌──────────────────────────────────────────┐
│  CDN (Vercel/Cloudflare)                │
│  - Static assets                         │
│  - Edge caching                          │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│  Next.js App (Vercel/Server)            │
│  - SSR pages                             │
│  - API routes                            │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│  NestJS API (Cloud Run/EC2/Heroku)      │
│  - Business logic                        │
│  - Authentication                        │
└───────────────┬──────────────────────────┘
                ↓
┌──────────────────────────────────────────┐
│  PostgreSQL (Cloud SQL/RDS/Neon)        │
│  - Primary database                      │
│  - Automated backups                     │
└──────────────────────────────────────────┘
```

## Scalability Considerations

### Current Capacity
- **Users**: ~200 (club members)
- **Teams**: ~100 per performance
- **Performances**: ~4 per year
- **Traffic**: Low to moderate

### Growth Strategy

**Phase 1** (Current): Single-server deployment
**Phase 2**: Horizontal scaling with load balancer
**Phase 3**: Database read replicas
**Phase 4**: Microservices if needed

### Bottleneck Analysis

**Likely bottlenecks**:
1. Database connections (solved with connection pooling)
2. File uploads (future: use CDN + object storage)
3. Real-time features (future: WebSockets or polling)

**Non-bottlenecks** (not worried about):
- API throughput (NestJS is fast)
- Frontend rendering (Next.js is optimized)
- Build times (Turborepo caching)

---

This architecture prioritizes **developer experience**, **type safety**, and **maintainability** while remaining scalable for future growth.
