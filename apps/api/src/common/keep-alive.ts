import type { Server } from "http"

// Traefik은 백엔드와 맺은 유휴 연결을 90초까지 들고 있다가 다시 쓴다.
// 서버가 그보다 먼저 끊으면(Node 기본 5초), 끊는 순간에 온 POST·PATCH는
// Traefik이 다시 보내지 않아 502가 된다.
const PROXY_IDLE_TIMEOUT_MS = 90_000

export function keepConnectionsLongerThanProxy(server: Server) {
  server.keepAliveTimeout = PROXY_IDLE_TIMEOUT_MS + 5_000
}
