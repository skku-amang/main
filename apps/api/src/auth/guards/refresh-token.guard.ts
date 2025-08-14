import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthError } from "@repo/api-client"

@Injectable()
export class RefreshTokenGuard extends AuthGuard("jwt-refresh") {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (info) {
      switch (info.name) {
        case "TokenExpiredError":
          throw new AuthError("리프레쉬 토큰이 만료되었습니다.")
        case "JsonWebTokenError":
          throw new AuthError("유효하지 않은 형식의 리프레쉬 토큰입니다.")
        default:
          throw new AuthError(
            "리프레쉬 토큰 인증 중 알 수 없는 오류가 발생했습니다."
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
