import { ExecutionContext, Injectable, Logger } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"
import {
  AuthError,
  AccessTokenExpiredError,
  AccessTokenNotFoundError
} from "@repo/api-client"
import { TokenExpiredError, JsonWebTokenError } from "@nestjs/jwt"
import { JwtPayload } from "@repo/shared-types"
import { Request, Response } from "express"
import {
  clearAuthCookies,
  extractRefreshToken,
  isRefreshTokenSentTo
} from "../auth-cookie.util"

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt-access") {
  private readonly logger = new Logger(AccessTokenGuard.name)

  constructor(private reflector: Reflector) {
    super()
  }

  private isPublic(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])
  }

  async canActivate(context: ExecutionContext) {
    // 공개 API도 토큰이 있으면 읽는다 (운영진에게만 보이는 정보가 있음).
    // 토큰이 없거나 깨져도 비로그인으로 통과 — handleRequest가 user를 비운다
    if (this.isPublic(context)) {
      try {
        await super.canActivate(context)
      } catch (error) {
        // 토큰 문제가 아닌 예외는 전역 필터를 안 거치므로 여기서 남긴다
        if (!(error instanceof AuthError))
          this.logger.warn(`optional auth failed: ${String(error)}`)
      }
      return true
    }

    return (await super.canActivate(context)) as boolean
  }

  handleRequest<TUser = JwtPayload>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any
  ): TUser {
    if (this.isPublic(context)) {
      if (err && !(err instanceof AuthError))
        this.logger.warn(`optional auth failed: ${String(err)}`)
      return (err || info || !user ? undefined : user) as TUser
    }

    if (info) {
      if (info instanceof TokenExpiredError) {
        const req = context.switchToHttp().getRequest<Request>()

        // RT가 없으면 refresh로 복구할 수 없다. 그런데도 "만료"로 응답하면
        // 프론트가 refresh를 시도 → 실패 → /login 이동 → 재시도를 무한 반복한다.
        // 복구 불가능한 AT cookie를 지워 트리거 조건 자체를 없앤다.
        // 단 RT cookie는 Path=/auth라 그 밖의 경로에선 늘 안 보인다 — 거기서 지우면
        // 멀쩡한 세션이 끊기므로 RT가 전송되는 경로에서만 판단한다 (#542).
        if (isRefreshTokenSentTo(req.path) && !extractRefreshToken(req)) {
          clearAuthCookies(context.switchToHttp().getResponse<Response>())
          throw new AuthError("세션이 만료되었습니다. 다시 로그인해주세요.")
        }

        throw new AccessTokenExpiredError("액세스 토큰이 만료되었습니다.")
      }

      if (info instanceof JsonWebTokenError) {
        throw new AuthError("유효하지 않은 형식의 액세스 토큰입니다.")
      }

      if (info.message === "No auth token") {
        throw new AccessTokenNotFoundError("액세스 토큰이 존재하지 않습니다.")
      }

      throw new AuthError("액세스 토큰 인증 중 알 수 없는 오류가 발생했습니다.")
    }

    // `validate` 함수에서 발생한 에러를 상위로 전파합니다.
    // - `AuthError`와 같이 의도된 커스텀 에러는 그대로 클라이언트에 전달되며,
    // - 그 외 예상치 못한 에러는 전역 Exception Filter에서 최종 처리될 수 있습니다.
    if (err) {
      throw err
    }

    // user 객체가 없는 경우
    if (!user) {
      throw new AuthError("사용자 정보를 확인할 수 없습니다.")
    }

    return user
  }
}
