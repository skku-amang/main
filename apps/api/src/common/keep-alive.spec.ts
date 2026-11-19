import { createServer, get, Server } from "http"
import { AddressInfo } from "net"
import { keepConnectionsLongerThanProxy } from "./keep-alive"

// Traefik이 유휴 연결을 다시 쓰는 최대 시간 (forwardingTimeouts.idleConnTimeout 기본값)
const PROXY_IDLE_SECONDS = 90

const advertisedKeepAliveSeconds = (server: Server) =>
  new Promise<number>((resolve, reject) => {
    const { port } = server.address() as AddressInfo
    get({ port, headers: { connection: "keep-alive" } }, (res) => {
      res.resume()
      const match = /timeout=(\d+)/.exec(String(res.headers["keep-alive"]))
      resolve(match ? Number(match[1]) : NaN)
    }).on("error", reject)
  })

describe("keepConnectionsLongerThanProxy", () => {
  let server: Server

  beforeEach((done) => {
    server = createServer((_req, res) => res.end("ok"))
    server.listen(0, done)
  })

  afterEach((done) => {
    server.closeAllConnections()
    server.close(done)
  })

  it("프록시가 유휴 연결을 다시 쓰는 시간보다 오래 연결을 유지한다", async () => {
    keepConnectionsLongerThanProxy(server)

    expect(await advertisedKeepAliveSeconds(server)).toBeGreaterThan(
      PROXY_IDLE_SECONDS
    )
  })
})
