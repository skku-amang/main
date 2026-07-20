import type { Meta, StoryObj } from "@storybook/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ME_QUERY_KEY } from "@/hooks/api/useAuth"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { ApiClientProvider } from "@/lib/providers/api-client-provider"
import type { DetailedUser } from "@repo/shared-types"

import Header from "./index"

const mockUser: DetailedUser = {
  id: 1,
  name: "홍길동",
  email: "hong@skku.edu",
  image: null,
  nickname: "길동",
  bio: null,
  isAdmin: false,
  isApproved: true,
  generation: { id: 1, order: 34 },
  sessions: []
}

const withUser = (user: DetailedUser | null) => {
  const Decorator = (Story: React.ComponentType) => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(ME_QUERY_KEY, user)
    return (
      <QueryClientProvider client={queryClient}>
        <ApiClientProvider>
          <AuthProvider>
            <Story />
          </AuthProvider>
        </ApiClientProvider>
      </QueryClientProvider>
    )
  }
  return Decorator
}

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    position: "sticky",
    mode: "dark"
  },
  argTypes: {
    position: {
      control: "radio",
      options: ["sticky", "fixed"]
    },
    mode: {
      control: "radio",
      options: ["light", "dark", "transparent"]
    }
  },
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const DarkMode: Story = {
  args: {
    mode: "dark"
  }
}

export const LightMode: Story = {
  args: {
    mode: "light"
  }
}

export const TransparentMode: Story = {
  args: {
    mode: "transparent"
  },
  decorators: [
    (Story) => (
      <div className="bg-gradient-to-b from-blue-900 to-blue-600">
        <Story />
      </div>
    )
  ]
}

export const MobileHomePage: Story = {
  args: {
    mode: "dark"
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/"
      }
    }
  }
}

export const MobileInnerPage: Story = {
  args: {
    mode: "dark"
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/performances/1/teams"
      }
    }
  }
}

export const LoggedIn: Story = {
  args: {
    mode: "dark"
  },
  decorators: [withUser(mockUser)]
}

export const LoggedInLightMode: Story = {
  args: {
    mode: "light"
  },
  decorators: [withUser(mockUser)]
}

export const MobileLoggedIn: Story = {
  args: {
    mode: "dark"
  },
  decorators: [withUser(mockUser)],
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/performances/1/teams"
      }
    }
  }
}
