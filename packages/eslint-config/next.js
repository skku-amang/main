/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@next/next/recommended",
    "plugin:@next/next/core-web-vitals",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "@next/next",
    "prettier"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    // React scope no longer necessary with new JSX transform
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-unused-vars": "off", // TypeScript가 처리
    "no-undef": "off", // TypeScript가 처리
    "react/no-unknown-property": [
      "error",
      {
        ignore: ["cmdk-input-wrapper"]
      }
    ],
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
    "@tanstack/query/no-rest-destructuring": "warn",
    "prettier/prettier": "error"
  },
  env: {
    browser: true,
    es2022: true,
    node: true
  }
}
