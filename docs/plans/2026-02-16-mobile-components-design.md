# Mobile Components Design: Search Bar & Pagination

**Issues**: #296 (Search Bar), #297 (Pagination)
**Date**: 2026-02-16
**Approach**: Responsive single component (CSS breakpoint switching)

## Search Bar (#296)

### Current State

- `apps/web/components/Search.tsx` — desktop-only, fixed `w-80` width
- 3 states already handled: Default (placeholder), Active (focus shadow), Filled (input text)
- Blinker: native `caret-color: #111827`

### Change

- `w-80` → `w-full md:w-80` (responsive width)
- No structural changes needed — mobile/desktop designs are identical except width

### Files Modified

- `apps/web/components/Search.tsx` — width change
- `apps/web/components/Search.stories.tsx` — add MobileView story

## Pagination (#297)

### Current State

- `apps/web/components/ui/pagination.tsx` — desktop numbered pagination primitives
- `apps/web/components/DataTable/Pagination.tsx` — TanStack Table specific

### Figma Design (Mobile)

```
[ < ]  Page  [ 1 ▼ ]  of 10  [ > ]
```

- Left/right chevron buttons (ghost variant, rounded)
- "Page" text label
- Select dropdown for page number
- "of N" total pages text

### Design

New `ResponsivePagination` component that renders both layouts internally:

```tsx
<ResponsivePagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

Internal structure:

- Mobile (`md:hidden`): Button(prev) + "Page" + Select(page#) + "of N" + Button(next)
- Desktop (`hidden md:flex`): existing pagination primitives (numbered links)

### Files Created

- `apps/web/components/ui/responsive-pagination.tsx` — new component
- `apps/web/components/ui/responsive-pagination.stories.tsx` — stories

### Files Unchanged

- `apps/web/components/ui/pagination.tsx` — existing primitives preserved

## Implementation Strategy

- Separate git worktrees per issue
  - `feat/mobile-search-bar` (#296)
  - `feat/mobile-pagination` (#297)
- Storybook stories for visual verification
