import { readPublicEnvFromProcess } from "@/lib/publicEnv"

export const dynamic = "force-dynamic"

export function GET() {
  const body = `window.__ENV=${JSON.stringify(readPublicEnvFromProcess())}`
  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      // Cloudflare는 .js를 기본 캐시하므로 명시적으로 막는다. 값은 배포마다 바뀔 수 있다
      "Cache-Control": "no-store"
    }
  })
}
