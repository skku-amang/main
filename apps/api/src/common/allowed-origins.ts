export const ALLOWED_ORIGINS: (string | RegExp)[] = [
  /^http:\/\/localhost:\d+$/,
  "https://amang.json-server.win",
  "https://amang.staging.json-server.win",
  /\.vercel\.app$/
]

export function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === "string" ? allowed === origin : allowed.test(origin)
  )
}
