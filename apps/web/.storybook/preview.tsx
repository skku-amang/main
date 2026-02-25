import type { Preview } from "@storybook/react"
import { withThemeByClassName } from "@storybook/addon-themes"
import { SessionProvider } from "next-auth/react"
import React from "react"

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
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    )
  ]
}

export default preview
