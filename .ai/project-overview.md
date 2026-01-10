# AMANG Performance Management System - Project Overview

## What is AMANG?

AMANG (아망) is a music performance club at Sungkyunkwan University (SKKU) in South Korea. The club brings together students passionate about music to collaborate, form bands, and perform at concerts throughout the academic year.

## System Purpose

This web application manages the entire lifecycle of music performances for AMANG:

### Key Workflows

1. **Performance Planning**
   - Administrators create performance events (concerts)
   - Each performance has a name, date, location, and description
   - Multiple teams participate in each performance

2. **Team Formation**
   - Team leaders create teams for specific songs
   - Each team belongs to one performance
   - Leaders specify which musical sessions (roles) they need
   - Example: A team might need 1 vocal, 2 guitars, 1 bass, 1 drum

3. **Member Recruitment**
   - Team leaders post available positions with capacities
   - Members browse teams and see which positions are open
   - Members apply to specific positions within sessions
   - Applications are first-come, first-served with position locking

4. **Team Coordination**
   - Once positions are filled, teams can rehearse
   - Team information is public for all members to view
   - Leaders can manage their team composition

## User Roles

### General Members
- Browse performances and teams
- Apply to open team positions
- Cancel their own applications
- View team compositions and details

### Team Leaders
- Create teams for performances
- Define session requirements (which instruments/roles needed)
- Manage team details (song info, poster, description)
- Update or delete their own teams
- Cannot directly add members (members must apply)

### Administrators
- Create and manage performances
- Manage generations (member cohorts)
- Manage sessions (musical roles)
- Oversee all teams and applications
- User management

## Core Concepts

### Performance
A concert event where multiple teams perform. Think of it as a "show" or "concert night".

**Example**: "2024 Spring Concert" at SKKU Student Hall on April 15, 2024

### Team
A group of musicians performing one song at a performance. Each team is associated with exactly one performance.

**Example**: Team "Urban Legends" performing "Bohemian Rhapsody" by Queen at the Spring Concert

### Session
A musical role or instrument category. The system supports:
- **VOCAL**: Singers
- **GUITAR**: Guitarists
- **BASS**: Bass guitarists
- **SYNTH**: Keyboard/synthesizer players
- **DRUM**: Drummers
- **STRINGS**: String instruments (violin, cello, etc.)
- **WINDS**: Wind instruments (saxophone, trumpet, flute, etc.)

### Team Session
Links a team to a specific session with capacity. Represents "how many people we need for this role".

**Example**: Team "Urban Legends" needs:
- 1 VOCAL (capacity: 1)
- 2 GUITAR (capacity: 2) 
- 1 BASS (capacity: 1)
- 1 DRUM (capacity: 1)

### Team Member
A specific user application to a team session position. Each position is numbered (index).

**Example**: In the 2 GUITAR positions:
- Position 1: John (Lead Guitar)
- Position 2: Sarah (Rhythm Guitar)

### Generation
Year-based cohorts of members. Used to track which year a member joined AMANG.

**Example**: "32nd Generation" (members who joined in 2024)

## Application Flow Example

Let's walk through a typical scenario:

1. **Admin creates performance**
   - "2024 Fall Festival" on November 20, 2024

2. **Leader (Alice) creates a team**
   - Team Name: "Jazz Fusion"
   - Song: "Spain" by Chick Corea
   - Performance: 2024 Fall Festival
   - Sessions needed:
     - VOCAL: 1 position
     - GUITAR: 1 position
     - BASS: 1 position
     - SYNTH: 1 position
     - DRUM: 1 position

3. **Members apply**
   - Bob applies: DRUM, position 1 ✅
   - Carol applies: GUITAR, position 1 ✅
   - David applies: BASS, position 1 ✅
   - Eve applies: VOCAL, position 1 ✅
   - Frank applies: SYNTH, position 1 ✅

4. **Team is complete**
   - All positions filled
   - Team can now rehearse and prepare

5. **Member changes mind**
   - Frank unapplies from SYNTH position 1
   - Position becomes available again
   - Grace applies and takes the SYNTH position

## Key Business Rules

### Team-Performance Binding
- **Every team must belong to exactly one performance**
- Teams cannot exist independently
- If a performance is deleted, all its teams are deleted too
- This enforces temporal organization (teams are for specific events)

### Position Locking
- **Each position can only be taken by one person**
- When someone applies to position 1 of GUITAR, that position is locked
- No one else can apply to that same position
- This prevents conflicts and double-booking

### One Application Per Session
- **Members can only apply once per session type in a team**
- You can't apply to both GUITAR position 1 and GUITAR position 2
- But you can apply to GUITAR in one team and BASS in the same team
- This prevents position hoarding

### Leader Control
- **Only team leaders can modify their teams**
- Leaders cannot directly add members
- Members must actively apply (opt-in model)
- Leaders can update team details, sessions, or delete the team

### Freshmen Teams
- Special flag: `isFreshmenFixed`
- Some teams are designated for freshmen only
- Enforces inclusive participation

### Original Songs
- Special flag: `isSelfMade`
- Tracks whether the team is performing an original composition
- Helps showcase student creativity

## Technology Choices

### Why Turborepo?
- Manages multiple apps (API + Web) in one repository
- Shared code packages reduce duplication
- Intelligent caching speeds up builds
- Easy to add more apps (mobile, admin panel, etc.)

### Why NestJS?
- Structured, scalable backend architecture
- Built-in dependency injection
- Excellent TypeScript support
- Rich ecosystem of modules (auth, validation, etc.)
- Familiar to developers with Angular experience

### Why Next.js?
- Server-side rendering for better SEO and performance
- App Router provides modern routing patterns
- React Server Components reduce client bundle size
- Built-in API routes for serverless functions
- Excellent developer experience

### Why Prisma?
- Type-safe database queries
- Automatic migration management
- Intuitive schema definition
- Great TypeScript integration
- Supports PostgreSQL natively

### Why PostgreSQL?
- Robust relational database
- ACID compliance ensures data integrity
- Excellent for complex relationships (teams, sessions, members)
- Unique constraints prevent race conditions
- Wide hosting support

### Why TanStack Query?
- Automatic caching and refetching
- Optimistic updates for better UX
- Loading and error states handled
- Reduces boilerplate code
- DevTools for debugging

## Development Philosophy

### Type Safety First
- TypeScript everywhere (frontend and backend)
- Shared types prevent API mismatches
- Compile-time error catching
- Better IDE autocompletion

### API-First Design
- Backend API is independent of frontend
- Can support multiple clients (web, mobile, desktop)
- Clear contracts via DTOs and schemas
- Easy to test in isolation

### Validation Everywhere
- Backend: Zod schemas validate all inputs
- Frontend: React Hook Form with Zod
- Database: Prisma constraints
- Defense in depth

### Atomic Operations
- Use database transactions
- Handle race conditions
- Ensure data consistency
- Graceful error handling

### Developer Experience
- Fast feedback loops
- Hot reloading in development
- Comprehensive error messages
- Consistent code style (Prettier, ESLint)

## Current State (November 2024)

### What's Working
✅ Complete database schema
✅ User authentication and authorization
✅ Team API with full CRUD operations
✅ Application/unapplication workflow
✅ Race condition handling
✅ Error handling and validation
✅ Performance, Generation, Session APIs
✅ Monorepo build system

### What's Next
🚧 Frontend pages for team management
🚧 Connect React components to API
🚧 Admin dashboard
🚧 Performance calendar view
🚧 User profile pages
🚧 Image upload for posters
🚧 YouTube video embedding
🚧 Search and filtering
🚧 Email notifications

### Technical Debt
⚠️ Need comprehensive E2E tests
⚠️ Frontend testing not set up
⚠️ File upload not implemented
⚠️ Rate limiting not implemented
⚠️ Logging not comprehensive
⚠️ Performance monitoring not set up

## Future Enhancements

### Short Term
- Complete frontend integration
- Add image upload for team posters
- Implement admin dashboard
- Add email notifications

### Medium Term
- Mobile app (React Native?)
- Practice room booking system
- Equipment reservation
- Team chat/messaging

### Long Term
- Live streaming integration
- Ticket sales for performances
- Alumni network features
- Archive of past performances
- Music resource library

## Contributing Guidelines

When working on this project:

1. **Understand the domain** - This is a real system used by real musicians
2. **Maintain data integrity** - Music performances depend on accurate data
3. **Test thoroughly** - Race conditions in applications are critical
4. **Keep it simple** - Students use this, make it intuitive
5. **Document changes** - Update relevant documentation
6. **Follow conventions** - Consistency helps the team
7. **Think mobile-first** - Many users access on phones

## Questions to Ask When Developing

- Does this feature help musicians collaborate better?
- Will this scale to 100+ teams per performance?
- Is this intuitive for non-technical users?
- Does this handle race conditions properly?
- Is this feature accessible and inclusive?
- Does this work well on mobile devices?
- Is error feedback clear and actionable?

## Success Metrics

The system succeeds when:
- Teams form quickly and efficiently
- Applications are fair (first-come, first-served)
- No data inconsistencies or conflicts
- Fast page loads and smooth interactions
- Users can accomplish tasks without help
- Performances are well-organized and documented
- New members can onboard easily

---

**Remember**: This system exists to bring musicians together and create amazing performances. Every feature should serve that goal. 🎵
