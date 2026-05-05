import { defineConfig } from "@hey-api/openapi-ts"

// Hey API codegen 설정.
// 입력: redocly가 bundle한 단일 yaml.
// 출력: src/generated/* (SDK 함수, 타입, Zod 스키마, TanStack Query queryOptions)
//
// 손코딩 생존:
// - src/client.ts: 토큰 부착 + 401 refresh + ProblemDocument → typed error 매핑
// - 그 외 모든 endpoint 코드는 generated.
export default defineConfig({
  input: "./src/openapi.bundled.yaml",
  output: {
    path: "./src/generated",
    format: "prettier",
    lint: false
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      // 출력 디렉터리 (src/generated/) 기준 상대 경로 — `../client`는 src/client.ts를 가리킴.
      runtimeConfigPath: "../client"
    },
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "zod",
      // FE 폼 검증을 위해 request schema도 Zod로 생성
      requests: true,
      responses: false
    },
    {
      name: "@tanstack/react-query",
      // queryOptions/mutationOptions 객체 생성 (per-endpoint hook 안 만듦)
      queryOptions: true,
      mutationOptions: true,
      infiniteQueryOptions: false
    }
  ]
})
