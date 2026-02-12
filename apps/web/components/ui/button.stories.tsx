import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"

import { Button } from "./button"

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    onClick: fn()
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link"
      ]
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"]
    },
    disabled: {
      control: "boolean"
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default"
  }
}

export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive"
  }
}

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline"
  }
}

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary"
  }
}

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost"
  }
}

export const Link: Story = {
  args: {
    children: "Link",
    variant: "link"
  }
}

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm"
  }
}

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg"
  }
}

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
