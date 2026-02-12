import type { Meta, StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "ui/Checkbox",
  component: Checkbox,
  tags: ["autodocs"]
}

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {}

export const Checked: Story = {
  args: {
    checked: true
  }
}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Checkbox Label</Label>
    </div>
  )
}

export const CheckboxGroup: Story = {
  render: () => {
    const categories = [
      "기타",
      "마이크",
      "믹서",
      "베이스",
      "스피커",
      "신디",
      "오인페",
      "앰프",
      "케이블",
      "그 외"
    ]

    return (
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <div key={category} className="flex items-center space-x-2">
            <Checkbox id={category} defaultChecked />
            <Label htmlFor={category}>{category}</Label>
          </div>
        ))}
      </div>
    )
  }
}
