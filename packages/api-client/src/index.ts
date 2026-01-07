import {
  AuthResponse,
  CreateEquipment,
  CreateGeneration,
  CreatePerformance,
  CreateRental,
  CreateSession,
  CreateTeam,
  CreateUser,
  Equipment,
  EquipmentWithRentalLog,
  GenerationDetail,
  GenerationList,
  GetRentalsQuery,
  LoginUser,
  LogoutResponse,
  Performance,
  PerformanceDetail,
  PerformanceTeamsList,
  RefreshTokenResponse,
  SessionDetail,
  SessionList,
  TeamApplication,
  TeamDetail,
  TeamList,
  UpdateEquipment,
  UpdateGeneration,
  UpdatePerformance,
  UpdateRental,
  RentalDetail,
  RentalList,
  UpdateSession,
  UpdateTeam,
  UpdateUser,
  User
} from "@repo/shared-types"
import { URLSearchParams } from "url"
import { ApiResult } from "./api-result"
import {
  AccessTokenExpiredError,
  ApiError,
  AuthError,
  ConflictError,
  DuplicateApplicationError,
  DuplicateMemberIndexError,
  DuplicateSessionUserError,
  DuplicateTeamSessionError,
  ForbiddenError,
  InternalServerError,
  InvalidMemberIndexError,
  InvalidPerformanceDateError,
  NoApplicationFoundError,
  NotFoundError,
  PositionOccupiedError,
  ProblemDocument,
  ReferencedEntityNotFoundError,
  RefreshTokenExpiredError,
  SessionNotFoundError,
  UnprocessableEntityError,
  ValidationError
} from "./errors"

/**
 * 서버에서 plain object로 전달되는 에러를
 * 자바스크립트의 에러 형식으로 변환합니다.
 */
function createErrorFromProblemDocument(problemDoc: ProblemDocument): ApiError {
  const { detail, instance, type } = problemDoc

  switch (type) {
    case "/errors/validation-error":
      return new ValidationError(detail, instance)
    case "/errors/authentication-error":
      return new AuthError(detail, instance)
    case "/errors/forbidden":
      return new ForbiddenError(detail, instance)
    case "/errors/not-found":
      return new NotFoundError(detail, instance)
    case "/errors/conflict":
      return new ConflictError(detail, instance)
    case "/errors/unprocessable-entity":
      return new UnprocessableEntityError(detail, instance)
    case "/errors/internal-server-error":
      return new InternalServerError(detail, instance)
    case "/errors/team/duplicate-application":
      return new DuplicateApplicationError(detail, instance)
    case "/errors/team/position-occupied":
      return new PositionOccupiedError(detail, instance)
    case "/errors/team/session-not-found":
      return new SessionNotFoundError(detail, instance)
    case "/errors/team/no-application-found":
      return new NoApplicationFoundError(detail, instance)
    case "/errors/team/invalid-member-index":
      return new InvalidMemberIndexError(detail, instance)
    case "/errors/team/duplicate-member-index":
      return new DuplicateMemberIndexError(detail, instance)
    case "/errors/team/duplicate-session-user":
      return new DuplicateSessionUserError(detail, instance)
    case "/errors/team/duplicate-team-session":
      return new DuplicateTeamSessionError(detail, instance)
    case "/errors/team/referenced-entity-not-found":
      return new ReferencedEntityNotFoundError(detail, instance)
    case "/errors/performance/invalid-performance-date":
      return new InvalidPerformanceDateError(detail, instance)
    case "/errors/token/refresh-token-expired":
      return new RefreshTokenExpiredError(detail, instance)
    case "/errors/token/access-token-expired":
      return new AccessTokenExpiredError(detail, instance)
    default:
      // API 서버에서 알 수 없는 에러가 전달될 경우
      // detail과 instance가 없을 수 있습니다.
      return new InternalServerError()
  }
}

// Promise에 에러 타입을 주입하기 위한 트릭
// 실제 런타임 동작은 Promise<T>와 동일하지만, 타입 시스템은 TError를 알 수 있게 됩니다.
export type PromiseWithError<T, TError> = Promise<T> & {
  __errorType?: TError
}

export default class ApiClient {
  private static instance: ApiClient | null = null
  private accessToken: string | null = null
  private onTokenExpired: (() => Promise<string | null>) | null = null
  private refreshPromise: Promise<string | null> | null = null

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
   * 액세스 토큰을 설정합니다.
   * 설정된 토큰은 이후 모든 API 요청의 Authorization 헤더에 포함됩니다.
   * @param token 액세스 토큰
   */
  public setAccessToken(token: string | null): void {
    this.accessToken = token
  }

  /**
   * 토큰이 만료되었을 때 호출할 콜백을 설정합니다.
   * 콜백은 새로운 액세스 토큰을 반환하거나, 갱신에 실패하면 null을 반환해야 합니다.
   * @param handler 토큰 만료 핸들러
   */
  public setOnTokenExpired(handler: () => Promise<string | null>): void {
    this.onTokenExpired = handler
  }

  /**
   * 내부 API 요청 헬퍼 메소드
   */
  private async _request<T, E extends ProblemDocument>(
    endpoint: string, // 예: "/posts", "/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>
  ): Promise<PromiseWithError<T, E>> {
    const options: RequestInit = {
      method,
      headers: {
        ...headers,
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` })
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
        options.credentials = "include"
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options)
      const data = (await response.json()) as ApiResult<T>

      if (data.isSuccess) {
        return data.data as T
      }

      const error = createErrorFromProblemDocument(
        data.error as ProblemDocument
      )

      // 액세스 토큰이 만료되었고 핸들러가 등록되어 있는 경우 갱신 시도
      if (error instanceof AccessTokenExpiredError && this.onTokenExpired) {
        // 여러 요청이 동시에 만료되었을 때 한 번만 갱신하도록 promise 공유
        if (!this.refreshPromise) {
          this.refreshPromise = this.onTokenExpired().finally(() => {
            this.refreshPromise = null
          })
        }

        const newToken = await this.refreshPromise

        if (newToken) {
          this.setAccessToken(newToken)
          // 새로운 토큰으로 재시도
          return this._request<T, E>(endpoint, method, body, headers)
        }
      }

      throw error
    } catch (error) {
      // 이미 ApiError인 경우 그대로 던짐
      if (error instanceof ApiError) {
        throw error
      }
      // 그 외의 경우 InternalServerError로 래핑 (네트워크 오류 등)
      throw new InternalServerError(
        error instanceof Error ? error.message : "Unknown error"
      )
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
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPerformances() {
    return this._request<Performance[], InternalServerError>(
      `/performances`,
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
   * @throws {ReferencedEntityNotFoundError} 존재하지 않는 리더, 세션, 또는 유저를 팀에 추가하는 경우
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
   * @throws {ReferencedEntityNotFoundError} 존재하지 않는 리더, 세션, 또는 유저를 팀에 추가하는 경우
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
   * @throws {ConflictError} 해당 시간에 이미 예약된 장비인 경우
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
   * 유저 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ConflictError} 이미 존재하는 유저인 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createUser(userData: CreateUser) {
    return this._request<
      User,
      | AuthError
      | ForbiddenError
      | ValidationError
      | ConflictError
      | InternalServerError
    >(`/users`, "POST", userData)
  }

  /**
   * 유저 정보 조회
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 정보 조회 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUserById(id: number) {
    return this._request<
      User,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/users/${id}`, "GET")
  }

  /**
   * 유저 목록 조회
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 정보 조회 권한이 없는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getUsers() {
    return this._request<
      User[],
      AuthError | ForbiddenError | InternalServerError
    >(`/users`, "GET")
  }

  /**
   * 유저 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public updateUser(id: number, userData: UpdateUser) {
    return this._request<
      User,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/users/${id}`, "PATCH", userData)
  }

  /**
   * 유저 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public deleteUser(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/users/${id}`, "DELETE")
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
      AuthResponse,
      | ValidationError
      | ConflictError
      | UnprocessableEntityError
      | InternalServerError
    >("/auth/signup", "POST", userData)
  }

  /**
   * 로그인
   * @throws {AuthError}
   * @throws {InternalServerError}
   */
  public login(loginUser: LoginUser) {
    return this._request<AuthResponse, AuthError | InternalServerError>(
      "/auth/login",
      "POST",
      loginUser
    )
  }

  /**
   * 로그아웃
   * @throws {InternalServerError}
   */
  public logout() {
    return this._request<LogoutResponse, AuthError | InternalServerError>(
      "/auth/logout",
      "POST"
    )
  }

  /**
   * 토큰 갱신
   */
  public refreshToken(refreshToken: string) {
    return this._request<RefreshTokenResponse, AuthError | InternalServerError>(
      "/auth/refresh",
      "POST",
      { refreshToken }
    )
  }
}

export * from "./api-result"
export * from "./errors"
