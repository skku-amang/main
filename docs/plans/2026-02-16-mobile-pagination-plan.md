# Mobile Pagination (#297) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a ResponsivePagination component that shows dropdown-based pagination on mobile and numbered pagination on desktop.

**Architecture:** New `responsive-pagination.tsx` component using CSS `md:hidden` / `hidden md:flex` to toggle between mobile (Select dropdown) and desktop (numbered links) views. Reuses existing `Button`, `Select`, and `Pagination` primitives.

**Tech Stack:** React, Radix UI (Select), Tailwind CSS, Storybook 10

---

### Task 1: Create Worktree

**Step 1: Create worktree and branch**

```bash
git worktree add .worktrees/mobile-pagination -b feat/mobile-pagination
```

**Step 2: Copy .env files**

```bash
cp apps/web/.env .worktrees/mobile-pagination/apps/web/.env 2>/dev/null || true
cp apps/api/.env .worktrees/mobile-pagination/apps/api/.env 2>/dev/null || true
```

**Step 3: Install dependencies and generate Prisma**

```bash
cd .worktrees/mobile-pagination && pnpm install
cd .worktrees/mobile-pagination/packages/database && npx prisma generate
```

---

### Task 2: Create ResponsivePagination Component

**Files:**

- Create: `apps/web/components/ui/responsive-pagination.tsx`

**Step 1: Create the component file**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}

const ResponsivePagination = React.forwardRef<
  HTMLElement,
  ResponsivePaginationProps
>(({ currentPage, totalPages, onPageChange, className }, ref) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      {/* Mobile: dropdown-based */}
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">Page</span>

        <Select
          value={String(currentPage)}
          onValueChange={(value) => onPageChange(Number(value))}
        >
          <SelectTrigger className="h-9 w-auto min-w-[3.5rem] gap-1 px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">of {totalPages}</span>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: numbered links */}
      <Pagination className="hidden md:flex">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
              className={cn(isFirstPage && "pointer-events-none opacity-50")}
            />
          </PaginationItem>

          {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => !isLastPage && onPageChange(currentPage + 1)}
              className={cn(isLastPage && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </nav>
  );
});
ResponsivePagination.displayName = "ResponsivePagination";

export { ResponsivePagination, type ResponsivePaginationProps };
```

**Step 2: Commit**

```bash
git add apps/web/components/ui/responsive-pagination.tsx
git commit -m "feat: create ResponsivePagination component (#297)"
```

---

### Task 3: Create Storybook Stories

**Files:**

- Create: `apps/web/components/ui/responsive-pagination.stories.tsx`

**Step 1: Create stories file**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";

import { ResponsivePagination } from "./responsive-pagination";

const meta: Meta<typeof ResponsivePagination> = {
  title: "UI/ResponsivePagination",
  component: ResponsivePagination,
  tags: ["autodocs"],
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: fn(),
  },
  argTypes: {
    currentPage: {
      control: { type: "number", min: 1 },
    },
    totalPages: {
      control: { type: "number", min: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};
```

**Step 2: Verify in Storybook**

```bash
cd apps/web && pnpm storybook
```

Open browser → navigate to UI/ResponsivePagination. Verify:

- Default: desktop numbered pagination visible
- MobileView: dropdown-based pagination visible
- FirstPage: previous button disabled
- LastPage: next button disabled
- FewPages: no ellipsis shown

**Step 3: Commit**

```bash
git add apps/web/components/ui/responsive-pagination.stories.tsx
git commit -m "feat: add ResponsivePagination storybook stories (#297)"
```

---

### Task 4: Build Check

**Step 1: Run type check**

```bash
pnpm check-types
```

Expected: PASS

**Step 2: Run lint**

```bash
pnpm lint
```

Expected: PASS

**Step 3: Run format check**

```bash
pnpm format
```

Expected: PASS
