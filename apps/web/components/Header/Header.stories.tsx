import type { Meta, StoryObj } from "@storybook/react"
import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

import Header from "./index"

const mockSession: Session = {
  user: {
    id: "1",
    name: "홍길동",
    email: "hong@skku.edu",
    image: null,
    nickname: "길동",
    isAdmin: false
  },
  accessToken: "mock-token",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

const withSession = (session: Session) => (Story: React.ComponentType) => (
  <SessionProvider session={session}>
    <Story />
  </SessionProvider>
)

const meta: Meta<typeof Header> = {
  title: "Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    position: "sticky",
    height: "82px",
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
    },
    height: {
      control: "text"
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
  decorators: [withSession(mockSession)]
}

export const LoggedInLightMode: Story = {
  args: {
    mode: "light"
  },
  decorators: [withSession(mockSession)]
}

export const MobileLoggedIn: Story = {
  args: {
    mode: "dark"
  },
  decorators: [withSession(mockSession)],
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
