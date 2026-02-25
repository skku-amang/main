import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"

import { ResponsivePagination } from "./responsive-pagination"

const meta: Meta<typeof ResponsivePagination> = {
  title: "UI/ResponsivePagination",
  component: ResponsivePagination,
  tags: ["autodocs"],
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: fn()
  },
  argTypes: {
    currentPage: {
      control: { type: "number", min: 1 }
    },
    totalPages: {
      control: { type: "number", min: 1 }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    }
  }
}

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10
  }
}

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10
  }
}

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10
  }
}

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3
  }
}

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1
  }
}
