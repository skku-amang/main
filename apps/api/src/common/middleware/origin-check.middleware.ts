import { NextFunction, Request, Response } from "express"
import { isAllowedOrigin } from "../allowed-origins"

/**
 * CSRF 방어 (ADR-0002): 상태 변경 요청의 Origin 헤더를 허용 목록과 대조.
 *
 * - GET/HEAD/OPTIONS는 상태를 바꾸지 않으므로 통과.
 * - Origin 부재 시 통과: 브라우저 외 클라이언트(curl, 서버 간 호출, 테스트)는
 *   Origin을 보내지 않으며, cookie도 없어 CSRF 성립 불가. 브라우저의
 *   cross-site 요청은 Origin을 항상 포함하므로 방어에 공백 없음.
 *   SameSite=Lax cookie가 2차 방어선.
 */
export function originCheck(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const method = req.method.toUpperCase()
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next()
  }

  const origin = req.headers.origin
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({
      isSuccess: false,
      error: {
        type: "/errors/forbidden",
        title: "Forbidden",
        status: 403,
        detail: "허용되지 않은 출처의 요청입니다."
      }
    })
    return
  }

  next()
}
