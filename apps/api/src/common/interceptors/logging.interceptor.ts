import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from "@nestjs/common"
import { Request } from "express"
import { Observable, tap } from "rxjs"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP")

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const { method, url, body, query, params, ip } = request
    const user = (request as any).user
    const userId = user?.sub ?? "anonymous"
    const startTime = Date.now()

    const requestLog: Record<string, unknown> = {
      method,
      url,
      userId,
      ip
    }

    if (Object.keys(params).length > 0) {
      requestLog.params = params
    }
    if (Object.keys(query).length > 0) {
      requestLog.query = query
    }
    if (body && Object.keys(body).length > 0) {
      requestLog.body = this.sanitizeBody(body)
    }

    this.logger.log(`→ ${method} ${url} [user: ${userId}]`)
    this.logger.debug(`Request: ${JSON.stringify(requestLog)}`)

    return next.handle().pipe(
      tap((responseData) => {
        const duration = Date.now() - startTime
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode

        this.logger.log(
          `← ${method} ${url} ${statusCode} ${duration}ms [user: ${userId}]`
        )
        this.logger.debug(`Response: ${JSON.stringify(responseData)}`)
      })
    )
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ["password", "refreshToken", "token", "secret"]
    const sanitized = { ...body }

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = "[REDACTED]"
      }
    }

    return sanitized
  }
}
