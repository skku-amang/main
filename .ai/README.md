# AI Documentation

This directory contains comprehensive documentation designed to help AI assistants (like GitHub Copilot, Cursor, Claude, etc.) understand and work with this codebase effectively.

## Documentation Files

### 📘 [project-overview.md](./project-overview.md)
**What is this project about?**

- High-level business domain explanation
- User roles and workflows
- Core concepts (Performance, Team, Session, etc.)
- Key business rules
- Technology choices and rationale
- Current project status
- Future roadmap

**Use this when:** You need to understand what the system does, who uses it, and why certain design decisions were made.

### 🏗️ [architecture.md](./architecture.md)
**How is the system structured?**

- System architecture diagrams
- Monorepo organization
- Backend architecture (NestJS)
- Frontend architecture (Next.js)
- Database design (Prisma + PostgreSQL)
- Shared packages architecture
- Security architecture
- Performance considerations
- Deployment architecture

**Use this when:** You need to understand how components interact, where to place new code, or how data flows through the system.

### 🛠️ [workflows.md](./workflows.md)
**How do I work with this codebase?**

- Getting started guide
- Common development tasks
- Feature development workflow
- Git workflow and conventions
- Debugging techniques
- Troubleshooting common issues
- Performance profiling
- Production deployment

**Use this when:** You need to perform a specific development task, debug an issue, or deploy changes.

## Root-Level Documentation

### 🎯 [.cursorrules](../.cursorrules)
**Quick reference for AI assistants**

A comprehensive single-file guide that includes:
- Project overview
- Architecture summary
- Business rules
- Development guidelines
- Code organization
- Current status
- Common patterns

This file is optimized for AI assistants that use `.cursorrules` format (like Cursor IDE) but is useful for any AI system.

## How to Use This Documentation

### For AI Assistants

When working with this codebase:

1. **Start with `.cursorrules`** - Get a comprehensive overview quickly
2. **Reference `project-overview.md`** - Understand business logic and domain concepts
3. **Consult `architecture.md`** - Learn where code should go and how it should be structured
4. **Follow `workflows.md`** - Execute specific development tasks correctly

### For Developers

This documentation is also valuable for human developers:

- **Onboarding**: Read in order (overview → architecture → workflows)
- **Quick Reference**: Jump to relevant sections as needed
- **Working with AI**: Understand what context the AI has access to

### For Code Reviews

When reviewing AI-generated code:

- Check if it follows patterns described in `architecture.md`
- Verify business rules from `project-overview.md` are respected
- Ensure workflows from `workflows.md` were followed

## Maintaining This Documentation

### When to Update

Update documentation when:

- ✅ Adding new features or modules
- ✅ Changing architecture or technology stack
- ✅ Modifying business rules or workflows
- ✅ Learning from issues or improvements
- ✅ Project status changes (e.g., feature completion)

### What to Update

| Change | Files to Update |
|--------|----------------|
| New feature completed | `.cursorrules` (status), `project-overview.md` (status) |
| Architecture change | `.cursorrules`, `architecture.md` |
| New technology added | `.cursorrules`, `architecture.md` |
| Business rule change | `.cursorrules`, `project-overview.md` |
| New workflow pattern | `workflows.md` |
| Development process change | `workflows.md` |

### Documentation Quality

Good documentation is:

- **Accurate**: Reflects current codebase state
- **Complete**: Covers all major areas
- **Clear**: Written for understanding, not just reference
- **Example-driven**: Shows real code and scenarios
- **Maintained**: Updated as the project evolves

## Documentation Philosophy

### Why Document for AI?

AI assistants work best when they have:

1. **Context**: What is this system trying to accomplish?
2. **Constraints**: What are the rules and patterns to follow?
3. **Examples**: What does good code look like here?
4. **Rationale**: Why were certain decisions made?

This documentation provides all four, making AI assistance more effective and aligned with project goals.

### Structure Principles

- **Hierarchical**: Start broad, get specific
- **Cross-referenced**: Link related concepts
- **Actionable**: Include examples and code snippets
- **Visual**: Use diagrams and tables where helpful
- **Consistent**: Follow same patterns across files

### AI-First Writing

When writing for AI assistants:

- ✅ Be explicit about patterns and conventions
- ✅ Include code examples liberally
- ✅ Explain the "why" behind decisions
- ✅ Use clear headings and structure
- ✅ Define domain-specific terms
- ✅ Show relationships between components

- ❌ Assume implicit knowledge
- ❌ Use vague descriptions
- ❌ Skip edge cases
- ❌ Forget to update when code changes

## Contributing to Documentation

### Small Updates

For minor corrections or additions:

```bash
# Edit the relevant file
vim .ai/project-overview.md

# Commit with clear message
git add .ai/
git commit -m "docs: update team application workflow"
```

### Large Updates

For major changes (new sections, restructuring):

1. Create a feature branch
2. Make comprehensive updates
3. Review for consistency across all files
4. Test by asking AI to solve a task with new docs
5. Create PR with documentation changes

### Review Checklist

When reviewing documentation PRs:

- [ ] Is the information accurate?
- [ ] Are examples complete and working?
- [ ] Are all relevant files updated?
- [ ] Is the writing clear and unambiguous?
- [ ] Are there cross-references where appropriate?
- [ ] Is it useful for both AI and human readers?

## Examples of Good Documentation

### Good: Specific and Actionable

```markdown
### Team Application Rules
- Users apply to specific positions (index) within a TeamSession
- Index must be between 1 and capacity (inclusive)
- Each position can only be taken by one member
- Race conditions are handled via database unique constraints

Example: If a team needs 2 guitarists (capacity: 2):
- Alice applies to GUITAR position 1 ✅
- Bob applies to GUITAR position 2 ✅
- Carol tries to apply to GUITAR position 1 ❌ (already taken)
```

### Bad: Vague and Incomplete

```markdown
### Team Applications
Users can apply to teams. The system handles this appropriately.
```

### Good: Complete with Context

```markdown
### Why NestJS?
- Structured, scalable backend architecture
- Built-in dependency injection
- Excellent TypeScript support
- Rich ecosystem of modules (auth, validation, etc.)
- Familiar to developers with Angular experience

Trade-offs:
- ✅ Better than Express for large teams
- ✅ More structure = easier to maintain
- ❌ Steeper learning curve than Express
- ❌ More boilerplate for simple apps
```

### Bad: Missing Rationale

```markdown
### Why NestJS?
We use NestJS for the backend.
```

## Additional Resources

### External Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Turborepo Documentation](https://turbo.build/repo/docs)

### Internal Resources

- [Database Schema](../packages/database/prisma/schema.prisma)
- [API Routes](../apps/api/src/)
- [Frontend Components](../apps/web/components/)

### Team Knowledge

- Team Slack/Discord for questions
- Code review discussions
- Architectural Decision Records (if maintained)

---

**Last Updated:** 2024-11-09

**Maintained By:** AMANG Development Team

**Questions?** Open an issue or discuss in team channels.
