import baseConfig from "./packages/eslint-config/base.js";
import nextJsConfig from "./packages/eslint-config/next.js";
import reactInternalConfig from "./packages/eslint-config/react-internal.js";

export default [
  // Next.js 앱에만 next-js 설정 적용
  ...nextJsConfig.map((cfg) => ({
    ...cfg,
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
  })),

  // React UI 패키지에만 react-internal 설정 적용
  ...reactInternalConfig.map((cfg) => ({
    ...cfg,
    files: ["packages/ui/**/*.{js,jsx,ts,tsx}"],
  })),

  // 기타 패키지에 base 설정 적용
  ...baseConfig.map((cfg) => ({
    ...cfg,
    files: [
      "apps/api/**/*.{js,ts}",
      "packages/api-client/**/*.{js,ts}",
      "packages/database/**/*.{js,ts}",
      "packages/shared-types/**/*.{js,ts}",
    ],
  })),

  // 모든 JS/TS 파일에 base 설정 적용 (최후 fallback)
  ...baseConfig.map((cfg) => ({
    ...cfg,
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  })),

  // 무시할 파일/폴더
  {
    ignores: ["**/dist/**", ".turbo/", "node_modules/"],
  },
];
