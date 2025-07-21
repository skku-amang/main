import pluginNext from "@next/eslint-plugin-next";
import pluginTanstackQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // 1. 전역 설정 및 기본 TypeScript 설정
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 2. React 관련 설정
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // 새 JSX 변환으로 불필요
      "react/prop-types": "off", // TypeScript 사용 시 불필요
    },
    settings: {
      react: {
        version: "detect", // 설치된 React 버전을 자동으로 감지
      },
    },
  },

  // 3. Next.js 관련 설정
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },

  // 4. Tanstack Query 관련 설정
  {
    plugins: {
      "@tanstack/query": pluginTanstackQuery,
    },
    rules: {
      ...pluginTanstackQuery.configs.recommended.rules,
      // 기존 커스텀 규칙
      "@tanstack/query/exhaustive-deps": "error",
      "@tanstack/query/stable-query-client": "error",
      "@tanstack/query/no-rest-destructuring": "warn",
    },
  },

  // 5. 커스텀 규칙 및 TypeScript 규칙 오버라이드
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "no-unused-vars": "off", // @typescript-eslint/no-unused-vars와 중복되므로 비활성화
      "no-undef": "off", // TypeScript 컴파일러가 처리하므로 비활성화
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["cmdk-input-wrapper"],
        },
      ],
    },
  },

  // 6. Prettier 설정 (가장 마지막에 와야 함)
  // 다른 규칙과 충돌하는 Prettier의 포매팅 관련 규칙들을 모두 비활성화합니다.
  eslintConfigPrettier,
  {
    plugins: {
      prettier: (await import("eslint-plugin-prettier")).default,
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
];