import type { Meta, StoryObj } from "@storybook/react"

import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./select"

const meta: Meta = {
  title: "ui/Select",
  tags: ["autodocs"]
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="guitar">기타</SelectItem>
        <SelectItem value="mic">마이크</SelectItem>
        <SelectItem value="mixer">믹서</SelectItem>
        <SelectItem value="bass">베이스</SelectItem>
        <SelectItem value="speaker">스피커</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const Large: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="lg" className="w-[250px]">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="guitar">기타</SelectItem>
        <SelectItem value="mic">마이크</SelectItem>
        <SelectItem value="mixer">믹서</SelectItem>
        <SelectItem value="bass">베이스</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label>
        관련 신청{" "}
        <span className="text-muted-foreground">선택을 입력하세요</span>
      </Label>
      <Select>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024-1">2024 년 정기공연</SelectItem>
          <SelectItem value="2024-2">2024 년 1월축제</SelectItem>
          <SelectItem value="2024-3">2024 년 봄맞이공연</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const SizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>default (base)</Label>
        <Select>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Default size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>lg</Label>
        <Select>
          <SelectTrigger size="lg" className="w-[250px]">
            <SelectValue placeholder="Large size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Option 1</SelectItem>
            <SelectItem value="2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
