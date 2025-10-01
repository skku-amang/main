import {
  CreateGeneration,
  CreatePerformance,
  CreateSession,
  CreateTeam,
  CreateUser,
  Generation,
  LoginUser,
  Performance,
  Session,
  Team,
  TeamApplication,
  UpdateGeneration,
  UpdatePerformance,
  UpdateSession,
  UpdateTeam,
  UpdateUser,
  User
} from "@repo/shared-types"
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
   * 내부 API 요청 헬퍼 메소드
   */
  private _request<T, E extends ProblemDocument>(
    endpoint: string, // 예: "/posts", "/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any,
    headers?: Record<string, string>
  ): PromiseWithError<T, E> {
    const options: RequestInit = {
      method,
      headers
    }

    if (
      body &&
      (method === "POST" ||
        method === "PUT" ||
        method === "PATCH" ||
        method === "DELETE")
    ) {
      options.headers = { "Content-Type": "application/json" }
      options.body = JSON.stringify(body)
    }

    const promise = fetch(`${this.baseUrl}${endpoint}`, options)
      .then(async (response) => {
        const data = (await response.json()) as ApiResult<T>
        if (data.isSuccess) {
          return data.data
        }
        throw createErrorFromProblemDocument(data.error as ApiError)
      })
      .catch(() => {
        // fetch 실패(네트워크 에러 등) 시
        throw new InternalServerError()
      })

    // 타입스크립트가 타입을 올바르게 추론하도록 명시적 캐스팅
    return promise as PromiseWithError<T, E>
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
      Performance,
      ValidationError | AuthError | ForbiddenError | InternalServerError
    >(`/performances`, "POST", performanceData)
  }

  /**
   * 공연 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getPerformanceById(id: number) {
    return this._request<Performance, NotFoundError | InternalServerError>(
      `/performances/${id}`,
      "GET"
    )
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
      Performance,
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
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/performances/${id}`, "DELETE")
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
      Team,
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
   * 공연에 속한 팀 목록 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeamsByPerformance(performanceId: number) {
    return this._request<Team[], NotFoundError | InternalServerError>(
      `/performances/${performanceId}/teams`,
      "GET"
    )
  }

  /**
   * 모든 팀 정보 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeams() {
    return this._request<Team[], InternalServerError>(`/teams/`, "GET")
  }

  /**
   * 팀 정보 조회
   * @throws {NotFoundError} 팀이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getTeamById(id: number) {
    return this._request<Team, NotFoundError | InternalServerError>(
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
      Team,
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
      null,
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
      Team,
      | AuthError
      | NotFoundError
      | SessionNotFoundError
      | ValidationError
      | DuplicateApplicationError
      | PositionOccupiedError
      | InternalServerError
    >(`/teams/${teamId}/apply`, "POST", teamApplicationData)
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
      Team,
      | AuthError
      | NotFoundError
      | SessionNotFoundError
      | NoApplicationFoundError
      | ForbiddenError
      | InternalServerError
    >(`/teams/${teamId}/unapply`, "POST", teamApplicationData)
  }

  /**
   * 기수 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public createGeneration(
    generationData: CreateGeneration
  ): PromiseWithError<
    Generation,
    AuthError | ForbiddenError | ValidationError | InternalServerError
  > {
    return this._request<
      Generation,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/generations`, "POST", generationData)
  }

  /**
   * 기수 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getGenerationById(
    id: number
  ): PromiseWithError<Generation, NotFoundError | InternalServerError> {
    return this._request<Generation, NotFoundError | InternalServerError>(
      `/generations/${id}`,
      "GET"
    )
  }

  /**
   * 기수 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getGenerations(): PromiseWithError<Generation[], InternalServerError> {
    return this._request<Generation[], InternalServerError>(
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
  public updateGeneration(
    id: number,
    generationData: UpdateGeneration
  ): PromiseWithError<
    Generation,
    | AuthError
    | ForbiddenError
    | NotFoundError
    | ValidationError
    | InternalServerError
  > {
    return this._request<
      Generation,
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
  public deleteGeneration(
    id: number
  ): PromiseWithError<
    null,
    AuthError | ForbiddenError | NotFoundError | InternalServerError
  > {
    return this._request<
      null,
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
      Session,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/sessions`, "POST", sessionData)
  }

  /**
   * 세션 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getSessionById(id: number) {
    return this._request<Session, NotFoundError | InternalServerError>(
      `/sessions/${id}`,
      "GET"
    )
  }

  /**
   * 세션 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public getSessions() {
    return this._request<Session[], InternalServerError>(`/sessions`, "GET")
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
      Session,
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
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/sessions/${id}`, "DELETE")
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
      { accessToken: string; refreshToken: string; user: User },
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
  public async login(loginUser: LoginUser) {
    const result = await this._request<
      { accessToken: string; refreshToken: string; user: User },
      AuthError | InternalServerError
    >("/auth/login", "POST", loginUser)
    return result
  }

  /**
   * 토큰 갱신
   */
  public refreshToken(userId: string, refreshToken: string) {
    return this._request<
      {
        accessToken: string
      },
      AuthError | InternalServerError
    >("/auth/refresh", "POST", { refresh_token: refreshToken }, { userId })
  }
}

export * from "./api-result"
export * from "./errors"
