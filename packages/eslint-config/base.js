import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error"
    }
  },
  {
    plugins: {
      onlyWarn
    }
  },
  {
    ignores: ["dist/**"]
  }
]

export default baseConfig
