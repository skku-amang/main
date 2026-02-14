import type { Meta, StoryObj } from "@storybook/react"

import Search from "./Search"

const meta: Meta<typeof Search> = {
  title: "Search",
  component: Search,
  tags: ["autodocs"]
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomWidth: Story = {
  args: {
    className: "w-60"
  }
}

export const FullWidth: Story = {
  args: {
    className: "w-full"
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    )
  ]
}
