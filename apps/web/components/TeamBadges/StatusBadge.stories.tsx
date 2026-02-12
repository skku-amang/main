import type { Meta, StoryObj } from "@storybook/react"

import StatusBadge from "./StatusBadge"

const meta: Meta<typeof StatusBadge> = {
  title: "TeamBadges/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "radio",
      options: ["Active", "Inactive"]
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    status: "Active"
  }
}

export const Inactive: Story = {
  args: {
    status: "Inactive"
  }
}

export const SideBySide: Story = {
  render: () => (
    <div className="flex gap-4">
      <StatusBadge status="Active" />
      <StatusBadge status="Inactive" />
    </div>
  )
}
