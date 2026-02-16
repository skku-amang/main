# Mobile Header (#295) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Storybook stories for the existing mobile header component to document its states and modes.

**Architecture:** No code changes needed — the mobile header already matches the Figma design. Only Storybook stories are added to document the three modes (light/dark/transparent) and two navigation states (home/inner page).

**Tech Stack:** Storybook 10 with `@storybook/nextjs-vite` (auto-stubs `next/navigation`, `next/image`, `next/font`)

---

### Task 1: Create Worktree

**Step 1: Create worktree and branch**

```bash
git worktree add .worktrees/mobile-header -b feat/mobile-header
```

**Step 2: Copy .env files**

```bash
cp apps/web/.env .worktrees/mobile-header/apps/web/.env 2>/dev/null || true
cp apps/api/.env .worktrees/mobile-header/apps/api/.env 2>/dev/null || true
```

**Step 3: Install dependencies and generate Prisma**

```bash
cd .worktrees/mobile-header && pnpm install
cd .worktrees/mobile-header/packages/database && npx prisma generate
```

---

### Task 2: Create Header Storybook Stories

**Files:**

- Create: `apps/web/components/Header/Header.stories.tsx`

**Context:** The Header component accepts these props:

- `position`: `"sticky"` | `"fixed"`
- `height`: string (default `"82px"`)
- `mode`: `"light"` | `"dark"` | `"transparent"` (default `"light"`)

The mobile view is shown at `md:hidden` (below 768px). It renders:

- `MobileBackButton` — uses `usePathname()` to check if home page (returns placeholder div on `/`, back arrow on other paths)
- Logo image — `/Logo.png` at 32x32
- `Sidebar` — hamburger menu icon that opens a Sheet

`@storybook/nextjs-vite` stubs `useRouter`, `usePathname`, `next/image`, `next/font`. Use `parameters.nextjs.navigation.pathname` to control `usePathname()` return value.

**Step 1: Create the stories file**

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import Header from "./index";

const meta: Meta<typeof Header> = {
  title: "Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    position: "sticky",
    height: "82px",
    mode: "dark",
  },
  argTypes: {
    position: {
      control: "radio",
      options: ["sticky", "fixed"],
    },
    mode: {
      control: "radio",
      options: ["light", "dark", "transparent"],
    },
    height: {
      control: "text",
    },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DarkMode: Story = {
  args: {
    mode: "dark",
  },
};

export const LightMode: Story = {
  args: {
    mode: "light",
  },
};

export const TransparentMode: Story = {
  args: {
    mode: "transparent",
  },
  decorators: [
    (Story) => (
      <div className="bg-gradient-to-b from-blue-900 to-blue-600">
        <Story />
      </div>
    ),
  ],
};

export const MobileDarkMode: Story = {
  args: {
    mode: "dark",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    nextjs: {
      navigation: {
        pathname: "/performances/1/teams",
      },
    },
  },
};

export const MobileHomePage: Story = {
  args: {
    mode: "dark",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    nextjs: {
      navigation: {
        pathname: "/",
      },
    },
  },
};

export const MobileInnerPage: Story = {
  args: {
    mode: "dark",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    nextjs: {
      navigation: {
        pathname: "/performances/1/teams",
      },
    },
  },
};
```

**Step 2: Commit**

```bash
git add apps/web/components/Header/Header.stories.tsx
git commit -m "feat: add Header storybook stories (#295)"
```

---

### Task 3: Verify in Storybook

**Step 1: Run Storybook**

```bash
cd apps/web && pnpm storybook
```

**Step 2: Verify stories**

Open browser and check each story:

- **DarkMode**: dark navy background, white icons, full nav on desktop
- **LightMode**: white background, desktop nav visible
- **MobileDarkMode**: mobile viewport, dark background, back arrow + logo + hamburger
- **MobileHomePage**: mobile viewport, no back arrow (placeholder div), logo + hamburger
- **MobileInnerPage**: mobile viewport, back arrow visible, logo + hamburger

**Step 3: Run build check**

```bash
pnpm check-types && pnpm lint
```

Expected: PASS
