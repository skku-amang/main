import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger
} from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import {
  ApiError,
  AuthError,
  ConflictError,
  Failure,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnprocessableEntityError,
  ValidationError
} from "@repo/api-client"
import * as Sentry from "@sentry/nestjs"
import { STATUS_CODES } from "node:http"

// Nest 기본 HttpException(없는 경로 404 등)을 클라이언트가 구분하는 에러 타입으로 매핑
const ERROR_BY_STATUS: Partial<Record<number, new () => ApiError>> = {
  [HttpStatus.BAD_REQUEST]: ValidationError,
  [HttpStatus.UNAUTHORIZED]: AuthError,
  [HttpStatus.FORBIDDEN]: ForbiddenError,
  [HttpStatus.NOT_FOUND]: NotFoundError,
  [HttpStatus.CONFLICT]: ConflictError,
  [HttpStatus.UNPROCESSABLE_ENTITY]: UnprocessableEntityError,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerError
}

@Catch()
export class AllErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllErrorFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const isServerError = httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR

    if (!isServerError) {
      this.logger.warn(
        `${httpStatus} ${(exception as HttpException).message} [${request.method} ${request.url}]`
      )
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Error: ${exception.name} - ${exception.message}`,
        exception.stack
      )
    } else {
      this.logger.error(
        `Unhandled Error: ${JSON.stringify(exception, null, 2)}`
      )
    }

    if (isServerError) {
      Sentry.captureException(exception, {
        extra: { url: request.url }
      })
    }

    const detail =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.message || exception.message
        : (exception as any)?.message ||
          "서버에서 처리되지 않은 오류가 발생했습니다."

    const ErrorClass = ERROR_BY_STATUS[httpStatus]
    const predefinedError = ErrorClass ? new ErrorClass() : undefined

    const responseBody = {
      isSuccess: false,
      isFailure: true,
      error: {
        // 대응하는 타입이 없으면 RFC 7807 기본값(about:blank + 상태 코드 문구)
        type: predefinedError?.type ?? "about:blank",
        status: httpStatus,
        title: predefinedError?.title ?? STATUS_CODES[httpStatus] ?? "Error",
        detail,
        instance: request.url
      }
    } satisfies Failure

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
