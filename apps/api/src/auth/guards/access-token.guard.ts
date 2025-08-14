import { ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "@nestjs/passport"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"
import { AuthError } from "@repo/api-client"

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt-access") {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // 1. Reflector를 사용해 'isPublic' 메타데이터를 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    // 2. 'isPublic'이 true이면, 즉시 접근을 허용
    if (isPublic) {
      return true
    }

    // 3. 'isPublic'이 아니면, 원래의 JWT 인증 로직을 실행
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any, info: any) {
    if (info) {
      switch (info.name) {
        case "TokenExpiredError":
          throw new AuthError("액세스 토큰이 만료되었습니다.")
        case "JsonWebTokenError":
          throw new AuthError("유효하지 않은 형식의 액세스 토큰입니다.")
        default:
          throw new AuthError(
            "액세스 토큰 인증 중 알 수 없는 오류가 발생했습니다."
          )
      }
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
