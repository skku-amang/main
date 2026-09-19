import { gray, italic, white } from "colorette"
import { randomUUID } from "crypto"
import type { Params } from "nestjs-pino"
import type { PrettyOptions } from "pino-pretty"
import PinoPretty from "pino-pretty"
import { format } from "sql-formatter"
import { JwtService } from "@nestjs/jwt"
import { JwtPayload } from "@repo/shared-types"
import * as Sentry from "@sentry/nestjs"
import { extractAccessToken } from "../../auth/auth-cookie.util"
import { isHealthCheckPath } from "../../health/health-path"

const jwtService = new JwtService()

// W3C trace-flags sampled 비트 — 켜진 트레이스만 Sentry·Tempo에 저장된다
const TRACE_FLAG_SAMPLED = 0x01

const pinoPrettyOptions: PrettyOptions = {
  messageFormat: (log, messageKey) => {
    const msg = log[messageKey] as string
    const contextName = gray(italic(log.context as string))
    return msg && contextName
      ? `${msg} ${white("--")} ${contextName}`
      : `${msg}${contextName}`
  },
  customPrettifiers: {
    query: (q) => format(String(q), { language: "postgresql" })
  },
  ignore: "context,hostname,pid,message"
}

export const pinoLoggerModuleOption: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === "production" ? "info" : "trace",
    // 성공한 kubelet probe는 노이즈라 생략, 실패는 장애 조사용으로 남긴다
    customLogLevel(req, res, err) {
      if (isHealthCheckPath(req.url) && !err && res.statusCode < 400) {
        return "silent"
      }
      return "info"
    },
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    stream: process.stdout.isTTY ? PinoPretty(pinoPrettyOptions) : undefined,
    mixin(mergeObject: any) {
      if (!mergeObject.msg && mergeObject.message) {
        mergeObject = { ...mergeObject, msg: mergeObject.message }
      }
      // 샘플링 안 된 trace_id는 어디에도 없는 트레이스를 가리키므로 남기지 않는다
      const spanContext = Sentry.getActiveSpan()?.spanContext()
      if (spanContext && spanContext.traceFlags & TRACE_FLAG_SAMPLED) {
        mergeObject = { ...mergeObject, trace_id: spanContext.traceId }
      }
      return mergeObject
    },
    customProps(req: any) {
      // 인증(passport strategy)과 같은 곳에서 토큰을 읽는다 — 추출 경로가
      // 갈라지면 인증 방식이 바뀔 때 로그만 뒤처진다 (#458, #572)
      const token = extractAccessToken(req)
      const payload = token ? jwtService.decode<JwtPayload>(token) : null

      return payload?.sub ? { userId: payload.sub } : { userId: "anonymous" }
    },
    genReqId(req, res) {
      const id = randomUUID()
      res.setHeader("X-Request-Id", id)
      return id
    },
    serializers: {
      req(req) {
        req.body = req.raw?.body
        return req
      }
    },
    redact: [
      "req.body.password",
      "req.body.refreshToken",
      "req.headers.authorization",
      "req.headers.cookie"
    ]
  }
}
