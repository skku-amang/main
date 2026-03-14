import type { Preview } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import React from "react"

import { ApiClientProvider } from "@/lib/providers/api-client-provider"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

import "./fonts.css"
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    layout: "centered"
  },

  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark"
      },
      defaultTheme: "light"
    }),
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={null}>
          <ApiClientProvider>
            <Story />
          </ApiClientProvider>
        </SessionProvider>
      </QueryClientProvider>
    )
  ]
}

export default preview
