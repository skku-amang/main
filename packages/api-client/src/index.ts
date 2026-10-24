import {
  CreateEquipment,
  CreateGeneration,
  CreatePerformance,
  CreateRental,
  CreateSession,
  CreateTeam,
  CreateUser,
  DetailedUser,
  DetailedUserList,
  Equipment,
  EquipmentWithRentalLog,
  GenerationDetail,
  GenerationList,
  GetPerformancesQuery,
  GetRentalsQuery,
  AuthSessionsResponse,
  LoginResponse,
  LoginUser,
  MeResponse,
  Performance,
  PerformanceDetail,
  PerformanceTeamsList,
  SessionDetail,
  SessionList,
  SignUpResponse,
  TeamApplication,
  TeamDetail,
  TeamList,
  UpdateEquipment,
  UpdateGeneration,
  UpdatePerformance,
  UpdateRental,
  UpdatePassword,
  UpdateProfile,
  UpdateUser,
  RentalDetail,
  RentalList,
  UpdateSession,
  UpdateTeam,
  MemberProfile,
  publicUser,
  publicUserList,
  PresignedUrlRequest,
  PresignedUrlResponse,
  GetNotificationsQuery,
  NotificationItem,
  NotificationList,
  UnreadNotificationCount,
  MarkNotificationsReadBySubject,
  NotificationPreferences,
  UpdateNotificationPreferences,
  CreatePushSubscription,
  DeletePushSubscription
} from "@repo/shared-types"
import { ApiResult } from "./api-result"
import {
  AccessTokenExpiredError,
  AccessTokenNotFoundError,
  ApiError,
  AuthError,
  ConflictError,
  DuplicateApplicationError,
  DuplicateMemberIndexError,
  DuplicateSessionUserError,
  DuplicateTeamSessionError,
  ErrorType,
  ErrorTypeValue,
  ForbiddenError,
  InternalServerError,
  InvalidMemberIndexError,
  InvalidPerformanceDateError,
  NoApplicationFoundError,
  NotFoundError,
  PerformanceRecruitmentClosedError,
  PositionOccupiedError,
  ProblemDocument,
  ReferencedEntityNotFoundError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  SessionNotFoundError,
  UnprocessableEntityError,
  UpstreamError,
  ValidationError,
  UserNotApprovedError
} from "./errors"

/**
 * 에러 종류별로 만들 에러 클래스.
 * ErrorType에 새 종류를 추가하고 여기를 빠뜨리거나, type이 다른 클래스를 짝지으면 컴파일 에러가 난다.
 */
const ERROR_CLASS_BY_TYPE: {
  [K in ErrorTypeValue]: new (
    detail?: string,
    instance?: string
  ) => ApiError & { readonly type: K }
} = {
  [ErrorType.VALIDATION_ERROR]: ValidationError,
  [ErrorType.AUTHENTICATION_ERROR]: AuthError,
  [ErrorType.FORBIDDEN]: ForbiddenError,
  [ErrorType.NOT_FOUND]: NotFoundError,
  [ErrorType.CONFLICT]: ConflictError,
  [ErrorType.UNPROCESSABLE_ENTITY]: UnprocessableEntityError,
  [ErrorType.INTERNAL_SERVER_ERROR]: InternalServerError,
  [ErrorType.TEAM_DUPLICATE_APPLICATION]: DuplicateApplicationError,
  [ErrorType.TEAM_POSITION_OCCUPIED]: PositionOccupiedError,
  [ErrorType.TEAM_SESSION_NOT_FOUND]: SessionNotFoundError,
  [ErrorType.TEAM_NO_APPLICATION_FOUND]: NoApplicationFoundError,
  [ErrorType.TEAM_INVALID_MEMBER_INDEX]: InvalidMemberIndexError,
  [ErrorType.TEAM_DUPLICATE_MEMBER_INDEX]: DuplicateMemberIndexError,
  [ErrorType.TEAM_DUPLICATE_SESSION_USER]: DuplicateSessionUserError,
  [ErrorType.TEAM_DUPLICATE_TEAM_SESSION]: DuplicateTeamSessionError,
  [ErrorType.TEAM_REFERENCED_ENTITY_NOT_FOUND]: ReferencedEntityNotFoundError,
  [ErrorType.TEAM_PERFORMANCE_RECRUITMENT_CLOSED]:
    PerformanceRecruitmentClosedError,
  [ErrorType.PERFORMANCE_INVALID_PERFORMANCE_DATE]: InvalidPerformanceDateError,
  [ErrorType.USER_NOT_APPROVED]: UserNotApprovedError,
  [ErrorType.TOKEN_REFRESH_TOKEN_EXPIRED]: RefreshTokenExpiredError,
  [ErrorType.TOKEN_REFRESH_TOKEN_NOT_FOUND]: RefreshTokenNotFoundError,
  [ErrorType.TOKEN_ACCESS_TOKEN_EXPIRED]: AccessTokenExpiredError,
  [ErrorType.TOKEN_ACCESS_TOKEN_NOT_FOUND]: AccessTokenNotFoundError
}

/**
 * 서버에서 plain object로 전달되는 에러를
 * 자바스크립트의 에러 형식으로 변환합니다.
 */
function createErrorFromProblemDocument(problemDoc: ProblemDocument): ApiError {
  const { detail, instance, type } = problemDoc

  if (!Object.hasOwn(ERROR_CLASS_BY_TYPE, type)) {
    // API 서버에서 알 수 없는 에러가 전달될 경우
    // detail과 instance가 없을 수 있습니다.
    return new InternalServerError()
  }
  const ErrorClass = ERROR_CLASS_BY_TYPE[type as ErrorTypeValue]
  return new ErrorClass(detail, instance)
}

// Promise에 에러 타입을 주입하기 위한 트릭
// 실제 런타임 동작은 Promise<T>와 동일하지만, 타입 시스템은 TError를 알 수 있게 됩니다.
export type PromiseWithError<T, TError> = Promise<T> & {
  __errorType?: TError
}

export default class ApiClient {
  private static instance: ApiClient | null = null
  private onTokenExpired: (() => Promise<boolean>) | null = null
  private refreshPromise: Promise<boolean> | null = null

  constructor(private baseUrl: string) {}

  /**
   * ApiClient 싱글톤 인스턴스를 반환합니다.
   * 초기화되지 않은 경우 오류를 발생시킵니다.
   * @returns ApiClient 인스턴스
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      throw new Error(
        "ApiClient has not been initialized. Call ApiClient.initialize(config) first."
      )
    }
    return ApiClient.instance
  }

  /**
   * 토큰이 만료되었을 때 호출할 콜백을 설정합니다.
   * 콜백은 갱신 성공 시 true를 반환해야 합니다. 갱신된 토큰은 httpOnly cookie로
   * 운반되므로 콜백이 토큰 값을 반환하지 않습니다 (ADR-0002).
   * @param handler 토큰 만료 핸들러
   */
  public setOnTokenExpired(handler: () => Promise<boolean>): void {
    this.onTokenExpired = handler
  }

  /**
   * 내부 API 요청 헬퍼 메소드
   * async로 선언하면 반환 타입이 Promise<PromiseWithError<T, E>>로 한 번 더 감싸져
   * 에러 타입(E) 추론이 깨지므로, 실제 요청은 _send에 맡기고 타입만 입힌다.
   */
  private _request<T, E extends ProblemDocument>(
    endpoint: string, // 예: "/posts", "/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>
  ): PromiseWithError<T, E> {
    return this._send<T>(endpoint, method, body, headers)
  }

  private async _send<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>,
    isRetry = false
  ): Promise<T> {
    const options: RequestInit = {
      method,
      credentials: "include",
      headers: {
        ...headers
      }
    }

    if (
      body &&
      (method === "POST" ||
        method === "PUT" ||
        method === "PATCH" ||
        method === "DELETE")
    ) {
      if (body instanceof FormData) {
        options.body = body
      } else {
        options.headers = {
          ...options.headers,
          "Content-Type": "application/json"
        }
        options.body = JSON.stringify(body)
      }
    }

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, options)
    } catch (error) {
      // 응답을 받기 전에 끊긴 요청 — 페이지 이동, 앱 전환, 절전 복귀 등 클라이언트 사정이 대부분이다.
      // error로 남기면 Sentry captureConsole이 이슈로 수집한다. 서버 장애는 게이트웨이 응답(UpstreamError)으로 따로 잡힌다.
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      console.info(
        `[ApiClient] Request interrupted - URL: ${this.baseUrl}${endpoint}, Error: ${errorMessage}`
      )
      throw new InternalServerError(errorMessage)
    }

    try {
      // 게이트웨이 오류 페이지 등 JSON이 아닌 응답을 그대로 파싱하면
      // 브라우저마다 다른 파싱 에러로 바뀌어 원래 상태 코드가 사라진다.
      const contentType = response.headers.get("content-type") ?? ""
      if (!contentType.includes("json")) {
        const detail = (await response.text()).slice(0, 200)
        console.error(
          `[ApiClient] Non-JSON response - URL: ${this.baseUrl}${endpoint}, Status: ${response.status}`
        )
        throw new UpstreamError(response.status, detail)
      }

      const data = (await response.json()) as ApiResult<T>

      if (data.isSuccess) {
        return data.data as T
      }

      const error = createErrorFromProblemDocument(
        data.error as ProblemDocument
      )

      // 액세스 토큰이 만료되었고 핸들러가 등록되어 있는 경우 갱신 시도.
      // 재시도는 1회만 — 갱신 후에도 만료 응답이 반복되면 그대로 throw (무한 재귀 방지)
      if (
        error instanceof AccessTokenExpiredError &&
        this.onTokenExpired &&
        !isRetry
      ) {
        // 여러 요청이 동시에 만료되었을 때 한 번만 갱신하도록 promise 공유
        if (!this.refreshPromise) {
          this.refreshPromise = this.onTokenExpired().finally(() => {
            this.refreshPromise = null
          })
        }

        const refreshed = await this.refreshPromise

        if (refreshed) {
          // 갱신된 토큰은 httpOnly cookie가 운반 — 헤더 토큰 갱신 없이 재시도
          return this._send<T>(endpoint, method, body, headers, true)
        }
      }

      throw error
    } catch (error) {
      // 이미 ApiError인 경우 그대로 던짐
      if (error instanceof ApiError) {
        throw error
      }
      // 그 외의 경우 InternalServerError로 래핑 (응답 본문 파싱 실패 등)
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      console.error(
        `[ApiClient] Unexpected error - URL: ${this.baseUrl}${endpoint}, Error: ${errorMessage}`
      )
      throw new InternalServerError(errorMessage)
    }
  }

  /**
   * 공연 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 공연 생성 권한이 없는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createPerformance(performanceData: CreatePerformance) {
    return this._request<
      PerformanceDetail,
      ValidationError | AuthError | ForbiddenError | InternalServerError
    >(`/performances`, "POST", performanceData)
  }

  /**
   * 공연 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPerformanceById(id: number) {
    return this._request<
      PerformanceDetail,
      NotFoundError | InternalServerError
    >(`/performances/${id}`, "GET")
  }

  /**
   * 공연 목록 조회
   * @param query.status "recruiting"이면 팀 모집 중인 공연만 종료 일시가 가까운 순으로 반환
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPerformances(query?: GetPerformancesQuery) {
    const searchParams = new URLSearchParams()
    if (query?.status) searchParams.append("status", query.status)
    const queryString = searchParams.toString()

    return this._request<Performance[], InternalServerError>(
      `/performances${queryString ? `?${queryString}` : ""}`,
      "GET"
    )
  }

  /**
   * 공연 수정
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 공연 수정 권한이 없는 경우
   * @throws {InvalidPerformanceDateError} 공연의 시작 일시가 종료 일시보다 이후인 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updatePerformance(id: number, performanceData: UpdatePerformance) {
    return this._request<
      PerformanceDetail,
      | NotFoundError
      | ValidationError
      | InternalServerError
      | AuthError
      | ForbiddenError
      | InvalidPerformanceDateError
    >(`/performances/${id}`, "PATCH", performanceData)
  }

  /**
   * 공연 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 공연 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deletePerformance(id: number) {
    return this._request<
      PerformanceDetail,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/performances/${id}`, "DELETE")
  }

  /**
   * 공연에 속한 팀 목록 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeamsByPerformance(performanceId: number) {
    return this._request<
      PerformanceTeamsList,
      NotFoundError | InternalServerError
    >(`/performances/${performanceId}/teams`, "GET")
  }

  /**
   * 팀 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InvalidMemberIndexError} 멤버 인덱스가 1과 세션의 capacity 사이의 값이 아닌 경우
   * @throws {DuplicateMemberIndexError} 세션 내에 중복된 멤버 인덱스가 존재하는 경우
   * @throws {DuplicateSessionUserError} 세션 내에 중복된 사용자가 존재하는 경우
   * @throws {DuplicateTeamSessionError} 한 팀에 동일한 세션을 중복하여 추가하는 경우
   * @throws {ReferencedEntityNotFoundError} 존재하지 않는 팀장, 세션, 또는 유저를 팀에 추가하는 경우
   * @throws {PerformanceRecruitmentClosedError} 팀 모집이 마감된 공연에 팀을 생성하는 경우
   * @throws {ConflictError} 이미 존재하는 데이터와 충돌이 발생한 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createTeam(teamData: CreateTeam) {
    return this._request<
      TeamDetail,
      | AuthError
      | InvalidMemberIndexError
      | DuplicateMemberIndexError
      | DuplicateSessionUserError
      | DuplicateTeamSessionError
      | ReferencedEntityNotFoundError
      | PerformanceRecruitmentClosedError
      | ConflictError
      | InternalServerError
    >(`/teams`, "POST", teamData)
  }

  /**
   * 모든 팀 정보 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeams() {
    return this._request<TeamList, InternalServerError>(`/teams/`, "GET")
  }

  /**
   * 팀 정보 조회
   * @throws {NotFoundError} 팀이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeamById(id: number) {
    return this._request<TeamDetail, NotFoundError | InternalServerError>(
      `/teams/${id}`,
      "GET"
    )
  }

  /**
   * 팀 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 팀 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 팀이 존재하지 않는 경우
   * @throws {InvalidMemberIndexError} 멤버 인덱스가 1과 세션의 capacity 사이의 값이 아닌 경우
   * @throws {DuplicateMemberIndexError} 세션 내에 중복된 멤버 인덱스가 존재하는 경우
   * @throws {DuplicateSessionUserError} 세션 내에 중복된 사용자가 존재하는 경우
   * @throws {DuplicateTeamSessionError} 한 팀에 동일한 세션을 중복하여 추가하는 경우
   * @throws {ReferencedEntityNotFoundError} 존재하지 않는 팀장, 세션, 또는 유저를 팀에 추가하는 경우
   * @throws {PerformanceRecruitmentClosedError} 팀을 팀 모집이 마감된 공연으로 옮기는 경우
   * @throws {ConflictError} 이미 존재하는 데이터와 충돌이 발생한 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateTeam(id: number, teamData: UpdateTeam) {
    return this._request<
      TeamDetail,
      | AuthError
      | NotFoundError
      | InvalidMemberIndexError
      | DuplicateMemberIndexError
      | DuplicateSessionUserError
      | DuplicateTeamSessionError
      | ReferencedEntityNotFoundError
      | PerformanceRecruitmentClosedError
      | ConflictError
      | InternalServerError
    >(`/teams/${id}`, "PUT", teamData)
  }

  /**
   * 팀 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 팀 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteTeam(id: number) {
    return this._request<
      TeamDetail,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/teams/${id}`, "DELETE")
  }

  /**
   * 팀에 지원
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {NotFoundError} 요청한 팀이 존재하지 않는 경우
   * @throws {SessionNotFoundError} 요청한 세션이 팀에 존재하지 않는 경우
   * @throws {ValidationError} 지원하고자 하는 팀의 index가 capacity를 초과하는 경우
   * @throws {DuplicateApplicationError} 이미 해당 세션에 지원한 경우
   * @throws {PositionOccupiedError} 이미 지원하고자 하는 index에 다른 멤버가 지원한 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public applyToTeam(teamId: number, teamApplicationData: TeamApplication) {
    return this._request<
      TeamDetail,
      | AuthError
      | NotFoundError
      | SessionNotFoundError
      | ValidationError
      | DuplicateApplicationError
      | PositionOccupiedError
      | InternalServerError
    >(`/teams/${teamId}/apply`, "PATCH", teamApplicationData)
  }

  /**
   * 팀 지원 취소
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {NotFoundError} 요청한 팀이 존재하지 않는 경우
   * @throws {SessionNotFoundError} 요청한 세션이 팀에 존재하지 않는 경우
   * @throws {NoApplicationFoundError} 해당 세션의 index에 지원한 기록이 없는 경우
   * @throws {ForbiddenError} 다른 사용자의 지원을 취소하려는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  // TODO: 추가적으로 오류 타입 정의 필요(예: 공연 종료로 인해 이미 마감된 팀인 경우 등)
  public unapplyFromTeam(teamId: number, teamApplicationData: TeamApplication) {
    return this._request<
      TeamDetail,
      | AuthError
      | NotFoundError
      | SessionNotFoundError
      | NoApplicationFoundError
      | ForbiddenError
      | InternalServerError
    >(`/teams/${teamId}/unapply`, "PATCH", teamApplicationData)
  }

  /**
   * 기수 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createGeneration(generationData: CreateGeneration) {
    return this._request<
      GenerationDetail,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/generations`, "POST", generationData)
  }

  /**
   * 기수 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getGenerationById(id: number) {
    return this._request<GenerationDetail, NotFoundError | InternalServerError>(
      `/generations/${id}`,
      "GET"
    )
  }

  /**
   * 기수 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getGenerations() {
    return this._request<GenerationList, InternalServerError>(
      `/generations`,
      "GET"
    )
  }

  /**
   * 기수 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateGeneration(id: number, generationData: UpdateGeneration) {
    return this._request<
      GenerationDetail,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/generations/${id}`, "PATCH", generationData)
  }

  /**
   * 기수 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteGeneration(id: number) {
    return this._request<
      GenerationDetail,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/generations/${id}`, "DELETE")
  }

  /**
   * 세션 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createSession(sessionData: CreateSession) {
    return this._request<
      SessionDetail,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/sessions`, "POST", sessionData)
  }

  /**
   * 세션 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getSessionById(id: number) {
    return this._request<SessionDetail, NotFoundError | InternalServerError>(
      `/sessions/${id}`,
      "GET"
    )
  }

  /**
   * 세션 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getSessions() {
    return this._request<SessionList, InternalServerError>(`/sessions`, "GET")
  }

  /**
   * 세션 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateSession(id: number, sessionData: UpdateSession) {
    return this._request<
      SessionDetail,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/sessions/${id}`, "PATCH", sessionData)
  }

  /**
   * 세션 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteSession(id: number) {
    return this._request<
      SessionDetail,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/sessions/${id}`, "DELETE")
  }

  /**
   * 장비 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 정바 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createEquipment(equipmentData: CreateEquipment) {
    return this._request<
      Equipment,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/equipments`, "POST", equipmentData)
  }

  /**
   * 장비 목록 조회
   * @param type - (선택) 장비 타입 필터 ('room' | 'item')
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getEquipments(type?: "room" | "item") {
    const searchParams = new URLSearchParams()

    if (type) searchParams.set("type", type)

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""

    return this._request<Equipment[], InternalServerError>(
      `/equipments${queryString}`,
      "GET"
    )
  }

  /**
   * 장비 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getEquipmentById(id: number) {
    return this._request<
      EquipmentWithRentalLog,
      NotFoundError | InternalServerError
    >(`/equipments/${id}`, "GET")
  }

  /**
   * 장비 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 장비 수정 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateEquipment(id: number, equipmentData: UpdateEquipment) {
    return this._request<
      EquipmentWithRentalLog,
      | AuthError
      | ForbiddenError
      | ValidationError
      | NotFoundError
      | InternalServerError
    >(`/equipments/${id}`, "PATCH", equipmentData)
  }

  /**
   * 장비 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 장비 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteEquipment(id: number) {
    return this._request<
      null,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ConflictError
      | InternalServerError
    >(`/equipments/${id}`, "DELETE")
  }

  /**
   * 대여 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ConflictError} 해당 시간대에 이미 다른 예약이 있는 경우
   * @throws {UnprocessableEntityError} 존재하지 않는 장비 또는 유저 ID가 포함된 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createRental(rentalData: CreateRental) {
    return this._request<
      RentalDetail,
      | AuthError
      | ValidationError
      | ConflictError
      | UnprocessableEntityError
      | InternalServerError
    >(`/rentals`, "POST", rentalData)
  }

  /**
   * 대여 목록 조회
   * @param query - 검색 필터 (type, equipmentId, from, to)
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getRentals(query?: GetRentalsQuery) {
    const searchParams = new URLSearchParams()

    if (query) {
      if (query.type) {
        searchParams.append("type", query.type)
      }
      if (query.equipmentId) {
        searchParams.append("equipmentId", String(query.equipmentId))
      }
      if (query.from) {
        const fromDate = query.from.toISOString()
        searchParams.append("from", String(fromDate))
      }
      if (query.to) {
        const toDate = query.to.toISOString()
        searchParams.append("to", String(toDate))
      }
    }

    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : ""

    return this._request<RentalList, InternalServerError>(
      `/rentals${queryString}`,
      "GET"
    )
  }

  /**
   * 대여 상세 조회
   * @throws {NotFoundError} 요청한 대여 기록이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getRentalById(id: number) {
    return this._request<RentalDetail, NotFoundError | InternalServerError>(
      `/rentals/${id}`,
      "GET"
    )
  }

  /**
   * 대여 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우 (ID 형식 등)
   * @throws {ConflictError} 시간 충돌 또는 종료 시간이 시작 시간보다 앞서는 경우
   * @throws {UnprocessableEntityError} 존재하지 않는 장비 또는 유저 ID가 포함된 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateRental(id: number, rentalData: UpdateRental) {
    return this._request<
      RentalDetail,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | ConflictError
      | UnprocessableEntityError
      | InternalServerError
    >(`/rentals/${id}`, "PATCH", rentalData)
  }

  /**
   * 대여 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 삭제 권한이 없는 경우 (본인 또는 관리자 아님)
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteRental(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/rentals/${id}`, "DELETE")
  }

  /**
   * 유저 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUsers() {
    return this._request<publicUserList, InternalServerError>(`/users`, "GET")
  }

  /**
   * 유저 목록 조회 (기존 유저 목록 조회 API 보다 상세한 정보를 포함하여 반환합니다.)
   * @throws {ForbiddenError} 전체 유저 확인 권한이 없는 경우 (요청을 보내는 사용자가 관리자 권한이 없을 때 발생)
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUsersForAdmin() {
    return this._request<DetailedUserList, InternalServerError>(
      `/users/admin`,
      "GET"
    )
  }

  /**
   * 승인 대기 중인 유저 목록 조회 (관리자용 API)
   * @throws {ForbiddenError} 관리자 권한이 없는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPendingUsers() {
    return this._request<
      DetailedUserList,
      ForbiddenError | InternalServerError
    >(`/users/admin/pending`, "GET")
  }

  /**
   * 특정 유저 조회
   * @throws {NotFoundError} id에 해당하는 유저를 찾을 수 없을 때
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUserById(id: number) {
    return this._request<publicUser, NotFoundError | InternalServerError>(
      `/users/${id}`,
      "GET"
    )
  }

  /**
   * 다른 부원 프로필. 비공개면 이름·사진만 (본인은 항상 전체)
   * @throws {NotFoundError} 사용자가 없거나 승인 전인 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getMemberProfile(id: number) {
    return this._request<
      MemberProfile,
      NotFoundError | AuthError | InternalServerError
    >(`/users/${id}/profile`, "GET")
  }

  /**
   * 유저 생성 (관리자용 API)
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ForbiddenError} 유저 생성 권한이 없는 경우 (요청을 보내는 사용자가 관리자 권한이 없을 때 발생)
   * @throws {ConflictError} 이미 사용중인 이메일, 닉네임을 입력했을 때 발생합니다.
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createUser(userData: CreateUser) {
    return this._request<
      DetailedUser,
      ValidationError | ForbiddenError | InternalServerError
    >(`/users`, "POST", userData)
  }

  /**
   * 내 프로필 수정
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ConflictError} 이미 사용중인 닉네임을 입력했을 때
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateProfile(data: UpdateProfile) {
    return this._request<
      DetailedUser,
      ValidationError | ConflictError | InternalServerError
    >(`/users/me`, "PATCH", data)
  }

  /**
   * 비밀번호 변경
   * @throws {ValidationError} 비밀번호 검증 실패 (형식 불일치, 기존 비밀번호 틀림, 새 비밀번호 동일)
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updatePassword(data: UpdatePassword) {
    return this._request<DetailedUser, ValidationError | InternalServerError>(
      `/users/me/password`,
      "PATCH",
      data
    )
  }

  /**
   * 유저 업데이트 (관리자용 API)
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ForbiddenError} 유저 수정 권한이 없는 경우 (요청을 보내는 사용자가 관리자 권한이 없을 때 발생)
   * @throws {NotFoundError} id에 해당하는 유저를 찾을 수 없을 때
   * @throws {ConflictError} 이미 사용중인 이메일, 닉네임을 입력했을 때 발생합니다.
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateUser(id: number, userData: UpdateUser) {
    return this._request<
      DetailedUser,
      ValidationError | ForbiddenError | InternalServerError
    >(`/users/${id}`, "PATCH", userData)
  }

  /**
   * 유저 삭제 (관리자용 API)
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ForbiddenError} 유저 수정 권한이 없는 경우 (요청을 보내는 사용자가 관리자 권한이 없을 때 발생)
   * @throws {NotFoundError} id에 해당하는 유저를 찾을 수 없을 때
   * @throws {ConflictError} 팀에서 팀장을 맡고 있는 사용자를 삭제하려고 할 때 발생합니다.
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteUser(id: number) {
    return this._request<
      null,
      | ValidationError
      | ForbiddenError
      | NotFoundError
      | ConflictError
      | InternalServerError
    >(`/users/${id}`, "DELETE")
  }

  /**
   * 유저 승인 (관리자용 API)
   * @throws {ForbiddenError} 관리자 권한이 없는 경우
   * @throws {NotFoundError} id에 해당하는 유저를 찾을 수 없을 때
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public approveUser(id: number) {
    return this._request<
      DetailedUser,
      ForbiddenError | NotFoundError | InternalServerError
    >(`/users/${id}/approve`, "PATCH")
  }

  /**
   * 회원가입
   * @throws {ValidationError}
   * @throws {ConflictError}
   * @throws {UnprocessableEntityError} 존재하지 않는 기수인 경우
   * @throws {InternalServerError}
   */
  public signup(userData: CreateUser) {
    return this._request<
      SignUpResponse,
      | ValidationError
      | ConflictError
      | UnprocessableEntityError
      | InternalServerError
    >("/auth/signup", "POST", userData)
  }

  /**
   * 로그인
   * @throws {AuthError}
   * @throws {UserNotApprovedError} 아직 승인되지 않은 계정인 경우
   * @throws {InternalServerError}
   */
  public login(loginUser: LoginUser) {
    return this._request<
      LoginResponse,
      AuthError | UserNotApprovedError | InternalServerError
    >("/auth/login", "POST", loginUser)
  }

  /**
   * 로그아웃
   * @throws {InternalServerError}
   */
  public logout() {
    return this._request<void, AuthError | InternalServerError>(
      "/auth/logout",
      "POST"
    )
  }

  /**
   * 세션 갱신 — cookie의 RT로 새 AT/RT를 Set-Cookie 받는다.
   * `_request`를 거치지 않는 raw 호출: 401 시 refresh를 다시 타는 재귀를 막고,
   * 호출자(TokenManager)가 Web Locks 잠금 안에서 실행할 수 있게 한다.
   * @throws {RefreshTokenExpiredError} RT 수명이 다한 경우 (정상적인 세션 종료)
   * @throws {RefreshTokenNotFoundError} RT cookie가 없는 경우 (정상적인 세션 종료)
   * @throws {UpstreamError} 그 밖의 실패 (5xx·게이트웨이 오류 등)
   */
  public async refreshSession(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    })
    if (response.ok) return

    // 호출자가 "정상적인 세션 종료(RT 만료·부재)"와 "예상 못 한 실패(5xx·게이트웨이)"를
    // 구분할 수 있어야 로그 레벨을 나눌 수 있다.
    // throw는 try 밖에서 — 안에서 던지면 아래 catch가 삼켜 전부 UpstreamError가 된다.
    let error: Error | null = null
    try {
      const data = (await response.json()) as ApiResult<never>
      if (!data.isSuccess && data.error) {
        error = createErrorFromProblemDocument(data.error as ProblemDocument)
      }
    } catch {
      // JSON이 아닌 응답(게이트웨이 오류 페이지 등)
    }

    throw (
      error ??
      new UpstreamError(
        response.status,
        `refresh failed: ${response.status} ${response.statusText}`
      )
    )
  }

  /**
   * 현재 로그인된 사용자 조회 (cookie 기반, ADR-0002)
   * @throws {AuthError} 로그인하지 않은 경우
   * @throws {InternalServerError}
   */
  public getMe() {
    return this._request<MeResponse, AuthError | InternalServerError>(
      "/auth/me",
      "GET"
    )
  }

  /**
   * 내 로그인 기기 목록
   * @throws {AuthError} 로그인하지 않은 경우
   * @throws {InternalServerError}
   */
  public getAuthSessions() {
    return this._request<AuthSessionsResponse, AuthError | InternalServerError>(
      "/auth/sessions",
      "GET"
    )
  }

  /**
   * 특정 기기 로그아웃. 그 기기의 접속은 최대 1시간 뒤 끊긴다.
   * @throws {AuthError} 로그인하지 않은 경우
   * @throws {InternalServerError}
   */
  public logoutAuthSession(sid: string) {
    return this._request<void, AuthError | InternalServerError>(
      `/auth/sessions/${encodeURIComponent(sid)}`,
      "DELETE"
    )
  }

  /**
   * 현재 기기를 제외한 모든 기기 로그아웃
   * @throws {AuthError} 로그인하지 않은 경우
   * @throws {InternalServerError}
   */
  public logoutOtherAuthSessions() {
    return this._request<void, AuthError | InternalServerError>(
      "/auth/sessions",
      "DELETE"
    )
  }

  /**
   * Presigned URL 요청
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPresignedUrl(request: PresignedUrlRequest) {
    return this._request<
      PresignedUrlResponse,
      AuthError | ValidationError | InternalServerError
    >(`/uploads/presigned-url`, "POST", request)
  }

  /**
   * 내 알림 목록 (최신순, cursor 페이지네이션)
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ValidationError} limit이 1~50 범위를 벗어난 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getNotifications(query?: Partial<GetNotificationsQuery>) {
    const searchParams = new URLSearchParams()
    if (query?.cursor) searchParams.append("cursor", String(query.cursor))
    if (query?.limit) searchParams.append("limit", String(query.limit))
    const queryString = searchParams.toString()

    return this._request<
      NotificationList,
      AuthError | ValidationError | InternalServerError
    >(`/notifications${queryString ? `?${queryString}` : ""}`, "GET")
  }

  /**
   * 내 안 읽은 알림 수
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUnreadNotificationCount() {
    return this._request<
      UnreadNotificationCount,
      AuthError | InternalServerError
    >(`/notifications/unread-count`, "GET")
  }

  /**
   * 알림 1건 읽음 처리 (멱등)
   * @throws {NotFoundError} 내 알림이 아니거나 없는 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public markNotificationRead(id: number) {
    return this._request<
      NotificationItem,
      NotFoundError | AuthError | InternalServerError
    >(`/notifications/${id}/read`, "PATCH")
  }

  /**
   * 내 알림 전체 읽음 처리
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public markAllNotificationsRead() {
    return this._request<{ count: number }, AuthError | InternalServerError>(
      `/notifications/read-all`,
      "PATCH"
    )
  }

  /**
   * 알림이 가리키는 팀/공연 페이지에 도달했을 때 그 대상의 안 읽은 알림을 읽음 처리
   * @throws {ValidationError} teamId·performanceId 중 하나만 보내지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public markNotificationsReadBySubject(
    subject: MarkNotificationsReadBySubject
  ) {
    return this._request<
      { count: number },
      ValidationError | AuthError | InternalServerError
    >(`/notifications/read`, "PATCH", subject)
  }

  /**
   * 알림 설정 조회 — 푸시를 끈 유형, 방해금지 시간대
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getNotificationPreferences() {
    return this._request<
      NotificationPreferences,
      AuthError | InternalServerError
    >(`/notifications/preferences`, "GET")
  }

  /**
   * 알림 설정 변경. 보낸 필드만 바뀌고 quietHours는 통째로. 바뀐 뒤 전체 설정을 돌려준다
   * @throws {ValidationError} 시(hour)가 0–23 밖이거나 유형이 올바르지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateNotificationPreferences(
    preferences: UpdateNotificationPreferences
  ) {
    return this._request<
      NotificationPreferences,
      ValidationError | AuthError | InternalServerError
    >(`/notifications/preferences`, "PATCH", preferences)
  }

  /**
   * 이 브라우저의 푸시 구독 등록 (같은 endpoint면 갱신)
   * @throws {ValidationError} endpoint·keys 형식이 올바르지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createPushSubscription(subscription: CreatePushSubscription) {
    return this._request<
      { id: number },
      ValidationError | AuthError | InternalServerError
    >(`/push/subscriptions`, "POST", subscription)
  }

  /**
   * 이 브라우저의 푸시 구독 해제 (본인 것만)
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deletePushSubscription(body: DeletePushSubscription) {
    return this._request<{ count: number }, AuthError | InternalServerError>(
      `/push/subscriptions`,
      "DELETE",
      body
    )
  }

  /**
   * 내가 별표한 팀 id 목록 (최근 별표 순)
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getMyTeamBookmarks() {
    return this._request<number[], AuthError | InternalServerError>(
      `/team-bookmarks`,
      "GET"
    )
  }

  /**
   * 팀 별표 (이미 별표했으면 그대로)
   * @throws {NotFoundError} 팀이 존재하지 않는 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public addTeamBookmark(teamId: number) {
    return this._request<void, NotFoundError | AuthError | InternalServerError>(
      `/team-bookmarks/${teamId}`,
      "PUT"
    )
  }

  /**
   * 팀 별표 해제 (본인 것만)
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public removeTeamBookmark(teamId: number) {
    return this._request<void, AuthError | InternalServerError>(
      `/team-bookmarks/${teamId}`,
      "DELETE"
    )
  }
}

export * from "./api-result"
export * from "./errors"
