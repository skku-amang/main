/**
 * Spec-derived 클라이언트의 응답 interceptor.
 *
 * 책임:
 *   1. Success envelope ({isSuccess: true, data: T}) → unwrap해서 data만 반환
 *   2. Error envelope ({isFailure: true, error: ProblemDocument}) → typed ApiError throw
 *   3. AccessTokenExpired에 한해 refresh 시도 후 retry
 *
 * 이 모듈은 import 자체로 interceptor를 등록 (side-effect). 앱은
 * `@repo/api-client/spec-client`를 한 번 import하면 됨.
 */
import { client } from "./generated/client.gen"
import { refreshAccessToken, setAccessToken, getAccessToken } from "./client"
import {
  AccessTokenExpiredError,
  ApiError,
  InternalServerError,
  type ProblemDocument
} from "./errors"
import { createErrorFromProblemDocument } from "./problem-mapper"

// 헤더 마커 — 한 요청에서 refresh-retry는 1회만.
const RETRY_HEADER = "x-amang-retry"

client.interceptors.response.use(async (response, request) => {
  // 성공: ApiResult envelope unwrap
  if (response.ok) {
    const json = await response.clone().json()
    if (json && typeof json === "object" && json.isSuccess === true) {
      // generated SDK가 response.json()을 다시 호출하므로
      // 새 Response 객체로 unwrapped data만 담아 돌려줌.
      return new Response(JSON.stringify(json.data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
    }
    return response
  }

  // 실패: ProblemDocument → typed error
  let problem: ProblemDocument | null = null
  try {
    const json = await response.clone().json()
    if (json?.error) {
      problem = json.error as ProblemDocument
    }
  } catch {
    // body 파싱 실패 — generic InternalServer로 처리
  }

  if (!problem) {
    throw new InternalServerError(
      `HTTP ${response.status} ${response.statusText}`
    )
  }

  const error = createErrorFromProblemDocument(problem)

  // AccessTokenExpired 한정 refresh + retry
  if (
    error instanceof AccessTokenExpiredError &&
    !request.headers.get(RETRY_HEADER)
  ) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      setAccessToken(newToken)
      // 새 토큰으로 동일 요청 재시도.
      const retryRequest = new Request(request, {
        headers: new Headers(request.headers)
      })
      retryRequest.headers.set("Authorization", `Bearer ${getAccessToken()}`)
      retryRequest.headers.set(RETRY_HEADER, "1")
      return fetch(retryRequest)
    }
  }

  throw error
})
