import type { Meta, StoryObj } from "@storybook/react"

import { Label } from "./label"
import { Input } from "./input"

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"]
    },
    error: {
      control: "boolean"
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
    placeholder: "Input text",
    size: "default"
  }
}

export const Small: Story = {
  args: {
    placeholder: "Small input",
    size: "sm"
  }
}

export const Large: Story = {
  args: {
    placeholder: "Large input",
    size: "lg"
  }
}

export const WithError: Story = {
  args: {
    placeholder: "Input text",
    error: true,
    defaultValue: "잘못된 입력"
  }
}

export const ErrorSmall: Story = {
  args: {
    placeholder: "Input text",
    error: true,
    size: "sm",
    defaultValue: "잘못된 입력"
  }
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true
  }
}

export const Labeled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">
        이름 <span className="text-destructive">*</span>
      </Label>
      <Input id="name" placeholder="성함을 입력하세요" />
    </div>
  )
}

export const LabeledWithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name-error">
        이름 <span className="text-destructive">*</span>
      </Label>
      <Input
        id="name-error"
        placeholder="Input text"
        error
        defaultValue="Input text"
      />
      <p className="text-xs text-destructive">This is the error message</p>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>sm</Label>
        <Input size="sm" placeholder="Small input" />
      </div>
      <div className="space-y-1">
        <Label>default (base)</Label>
        <Input size="default" placeholder="Default input" />
      </div>
      <div className="space-y-1">
        <Label>lg</Label>
        <Input size="lg" placeholder="Large input" />
      </div>
    </div>
  )
}
