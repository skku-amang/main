# Mobile Search Bar (#296) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Search component responsive — full-width on mobile, fixed w-80 on desktop.

**Architecture:** Modify existing `Search.tsx` CSS class from `w-80` to `w-full md:w-80`. Add Storybook story for mobile viewport verification.

**Tech Stack:** React, Tailwind CSS, Storybook 10

---

### Task 1: Create Worktree

**Step 1: Create worktree and branch**

```bash
git worktree add .worktrees/mobile-search-bar -b feat/mobile-search-bar
```

**Step 2: Copy .env files**

```bash
cp apps/web/.env .worktrees/mobile-search-bar/apps/web/.env 2>/dev/null || true
cp apps/api/.env .worktrees/mobile-search-bar/apps/api/.env 2>/dev/null || true
```

**Step 3: Install dependencies and generate Prisma**

```bash
cd .worktrees/mobile-search-bar && pnpm install
cd .worktrees/mobile-search-bar/packages/database && npx prisma generate
```

---

### Task 2: Make Search Width Responsive

**Files:**

- Modify: `apps/web/components/Search.tsx:13`

**Step 1: Change width class**

In `apps/web/components/Search.tsx`, line 13, change:

```tsx
// Before
"flex h-10 w-80 items-center gap-x-2.5 rounded-lg border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]";

// After
"flex h-10 w-full items-center gap-x-2.5 rounded-lg border border-gray-200 bg-white px-[13px] py-2 text-sm ring-offset-background drop-shadow-[0_1px_2px_rgb(64,63,84,0.1)] transition duration-300 focus-within:ring-0 focus-within:ring-offset-0 focus-within:drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:w-80";
```

Change: `w-80` → `w-full` and add `md:w-80` at end.

**Step 2: Commit**

```bash
git add apps/web/components/Search.tsx
git commit -m "feat: make Search component responsive width (#296)"
```

---

### Task 3: Add Mobile Storybook Story

**Files:**

- Modify: `apps/web/components/Search.stories.tsx`

**Step 1: Add MobileView story**

Replace the entire file with:

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import Search from "./Search";

const meta: Meta<typeof Search> = {
  title: "Search",
  component: Search,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomWidth: Story = {
  args: {
    className: "w-60",
  },
};

export const FullWidth: Story = {
  args: {
    className: "w-full",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full px-4">
        <Story />
      </div>
    ),
  ],
};
```

**Step 2: Verify in Storybook**

```bash
cd apps/web && pnpm storybook
```

Open browser → navigate to Search → MobileView story. Verify it fills the container.

**Step 3: Commit**

```bash
git add apps/web/components/Search.stories.tsx
git commit -m "feat: add MobileView storybook story for Search (#296)"
```

---

### Task 4: Build Check

**Step 1: Run type check**

```bash
pnpm check-types
```

Expected: PASS (no type errors)

**Step 2: Run lint**

```bash
pnpm lint
```

Expected: PASS
