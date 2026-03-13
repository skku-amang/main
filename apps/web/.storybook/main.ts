import path from "path"
import type { StorybookConfig } from "@storybook/nextjs-vite"

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(ts|tsx)"],

  addons: ["@storybook/addon-a11y", "@storybook/addon-themes"],

  framework: {
    name: "@storybook/nextjs-vite",
    options: {}
  },

  staticDirs: ["../public"],

  docs: {
    autodocs: "tag"
  },

  viteFinal(config) {
    config.resolve ??= {}
    config.resolve.alias ??= {}

    // Vite/Rollup이 CJS로 컴파일된 dist 대신 TypeScript 소스를 직접 번들링
    Object.assign(config.resolve.alias, {
      "@repo/api-client": path.resolve(__dirname, "../../../packages/api-client/src/index.ts"),
      "@repo/shared-types": path.resolve(__dirname, "../../../packages/shared-types/src/index.ts")
    })

    return config
  }
}

export default config
