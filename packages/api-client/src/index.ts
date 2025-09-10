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
  ProblemDocument,
  ApiError,
  AuthError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnprocessableEntityError,
  ValidationError,
  DuplicateApplicationError,
  PositionOccupiedError,
  SessionNotFoundError,
  NoApplicationFoundError
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
    default:
      // API 서버에서 알 수 없는 에러가 전달될 경우
      // detail과 instance가 없을 수 있습니다.
      return new InternalServerError()
  }
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
  private async _request<T, E>(
    endpoint: string, // 예: "/api/posts", "/api/projects/1" (항상 '/'로 시작 가정)
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {}
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

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options)
      const data = (await response.json()) as ApiResult<T>

      if (data.isSuccess) {
        return data.data
      }
      throw createErrorFromProblemDocument(data.error satisfies ProblemDocument)
    } catch {
      // 네트워크 에러만 클라이언트에서 처리
      throw new InternalServerError()
    }
  }

  /**
   * 공연 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createPerformance(performanceData: CreatePerformance) {
    return this._request<Performance, ValidationError | InternalServerError>(
      `/api/performances`,
      "POST",
      performanceData
    )
  }

  /**
   * 공연 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getPerformanceById(id: number) {
    return this._request<Performance, NotFoundError | InternalServerError>(
      `/api/performances/${id}`,
      "GET"
    )
  }

  /**
   * 공연 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getPerformances() {
    return this._request<Performance[], InternalServerError>(
      `/api/performances`,
      "GET"
    )
  }

  /**
   * 공연 수정
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updatePerformance(
    id: number,
    performanceData: UpdatePerformance
  ) {
    return this._request<
      Performance,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/performances/${id}`, "PATCH", performanceData)
  }

  /**
   * 공연 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 공연 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deletePerformance(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/performances/${id}`, "DELETE")
  }

  /**
   * 팀 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 팀 생성 권한이 없는 경우
   * @throws {NotFoundError} 요청한 공연이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createTeam(performanceId: number, teamData: CreateTeam) {
    return this._request<
      Team,
      | ValidationError
      | AuthError
      | ForbiddenError
      | NotFoundError
      | InternalServerError
    >(`/api/performances/${performanceId}/teams`, "POST", teamData)
  }

  /**
   * 공연에 속한 팀 목록 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getTeamsByPerformance(performanceId: number) {
    return this._request<Team[], NotFoundError | InternalServerError>(
      `/api/performances/${performanceId}/teams`,
      "GET"
    )
  }

  /**
   * 팀 정보 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getTeams() {
    return this._request<Team[], InternalServerError>(`/api/teams/`, "GET")
  }

  /**
   * 팀 정보 조회
   * @throws {NotFoundError} 팀이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getTeamById(id: number) {
    return this._request<Team, NotFoundError | InternalServerError>(
      `/api/teams/${id}`,
      "GET"
    )
  }

  /**
   * 팀 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 팀 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateTeam(id: number, teamData: UpdateTeam) {
    return this._request<
      Team,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/api/teams/${id}`, "PATCH", teamData)
  }

  /**
   * 팀 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 팀 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteTeam(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/teams/${id}`, "DELETE")
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
  public async applyToTeam(
    teamId: number,
    teamApplicationData: TeamApplication
  ) {
    return this._request<
      Team,
      AuthError | NotFoundError | ConflictError | InternalServerError
    >(`/api/teams/${teamId}/apply`, "POST", teamApplicationData)
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
  public async unapplyFromTeam(
    teamId: number,
    teamApplicationData: TeamApplication
  ) {
    return this._request<
      Team,
      AuthError | NotFoundError | UnprocessableEntityError | InternalServerError
    >(`/api/teams/${teamId}/cancel`, "POST", teamApplicationData)
  }

  /**
   * 기수 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createGeneration(generationData: CreateGeneration) {
    return this._request<
      Generation,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/api/generations`, "POST", generationData)
  }

  /**
   * 기수 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getGenerationById(id: number) {
    return this._request<Generation, NotFoundError | InternalServerError>(
      `/api/generations/${id}`,
      "GET"
    )
  }

  /**
   * 기수 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getGenerations() {
    return this._request<Generation[], InternalServerError>(
      `/api/generations`,
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
  public async updateGeneration(id: number, generationData: UpdateGeneration) {
    return this._request<
      Generation,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/api/generations/${id}`, "PATCH", generationData)
  }

  /**
   * 기수 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 기수 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteGeneration(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/generations/${id}`, "DELETE")
  }

  /**
   * 세션 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createSession(sessionData: CreateSession) {
    return this._request<
      Session,
      AuthError | ForbiddenError | ValidationError | InternalServerError
    >(`/api/sessions`, "POST", sessionData)
  }

  /**
   * 세션 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getSessionById(id: number) {
    return this._request<Session, NotFoundError | InternalServerError>(
      `/api/sessions/${id}`,
      "GET"
    )
  }

  /**
   * 세션 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getSessions() {
    return this._request<Session[], InternalServerError>(`/api/sessions`, "GET")
  }

  /**
   * 세션 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateSession(id: number, sessionData: UpdateSession) {
    return this._request<
      Session,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/api/sessions/${id}`, "PATCH", sessionData)
  }

  /**
   * 세션 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 세션 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteSession(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/sessions/${id}`, "DELETE")
  }

  /**
   * 유저 생성
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 생성 권한이 없는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {ConflictError} 이미 존재하는 유저인 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createUser(userData: CreateUser) {
    return this._request<
      User,
      | AuthError
      | ForbiddenError
      | ValidationError
      | ConflictError
      | InternalServerError
    >(`/api/users`, "POST", userData)
  }

  /**
   * 유저 정보 조회
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 정보 조회 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getUserById(id: number) {
    return this._request<
      User,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/users/${id}`, "GET")
  }

  /**
   * 유저 목록 조회
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 정보 조회 권한이 없는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getUsers() {
    return this._request<
      User[],
      AuthError | ForbiddenError | InternalServerError
    >(`/api/users`, "GET")
  }

  /**
   * 유저 수정
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 수정 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateUser(id: number, userData: UpdateUser) {
    return this._request<
      User,
      | AuthError
      | ForbiddenError
      | NotFoundError
      | ValidationError
      | InternalServerError
    >(`/api/users/${id}`, "PATCH", userData)
  }

  /**
   * 유저 삭제
   * @throws {AuthError} 로그인 하지 않은 경우
   * @throws {ForbiddenError} 유저 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteUser(id: number) {
    return this._request<
      null,
      AuthError | ForbiddenError | NotFoundError | InternalServerError
    >(`/api/users/${id}`, "DELETE")
  }

  /**
   * 회원가입
   * @throws {ValidationError}
   * @throws {ConflictError}
   * @throws {UnprocessableEntityError} 존재하지 않는 기수인 경우
   * @throws {InternalServerError}
   */
  public async register(userData: CreateUser) {
    return this._request<
      User,
      | ValidationError
      | ConflictError
      | UnprocessableEntityError
      | InternalServerError
    >("/api/register", "POST", userData)
  }

  /**
   * 로그인
   * @throws {AuthError}
   * @throws {InternalServerError}
   */
  public async login(loginUser: LoginUser) {
    return this._request<User, AuthError | InternalServerError>(
      "/api/login",
      "POST",
      loginUser
    )
  }
}

export * from "./api-result"
export * from "./errors"
