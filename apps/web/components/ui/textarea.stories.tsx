import type { Meta, StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "ui/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean"
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Type your message here."
  }
}

export const WithValue: Story = {
  args: {
    defaultValue: "동아리 활동에 대한 설명을 입력하세요."
  }
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true
  }
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="description">장비 설명</Label>
      <Textarea id="description" placeholder="예: 88 keys" />
    </div>
  )
}
