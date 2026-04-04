import { gray, italic, white } from "colorette"
import { randomUUID } from "crypto"
import type { Params } from "nestjs-pino"
import type { PrettyOptions } from "pino-pretty"
import PinoPretty from "pino-pretty"
import { format } from "sql-formatter"

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
    autoLogging: {
      ignore: (req) => req.url === "/health"
    },
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    stream:
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "staging"
        ? PinoPretty(pinoPrettyOptions)
        : undefined,
    mixin(mergeObject: any) {
      if (!mergeObject.msg && mergeObject.message) {
        mergeObject = { ...mergeObject, msg: mergeObject.message }
      }
      return mergeObject
    },
    customProps(req: any) {
      return req.user ? { userId: req.user.sub } : { userId: "anonymous" }
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
      "req.headers.authorization"
    ]
  }
}
