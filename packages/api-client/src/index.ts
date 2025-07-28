import {
  CreateUser,
  Generation,
  LoginUser,
  Performance,
  Session,
  Team,
  User
} from "@repo/shared-types"
import { ApiResult } from "./api-result"
import {
  ApiError,
  AuthError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ValidationError
} from "./errors"

/**
 * 서버에서 plain object로 전달되는 에러를
 * 자바스크립트의 에러 형식으로 변환합니다.
 */
function createErrorFromProblemDocument(problemDoc: ApiError): ApiError {
  const detail = problemDoc.detail

  switch (problemDoc.type) {
    case "/errors/not-found":
      return new NotFoundError(detail)
    case "/errors/internal-server-error":
      return new InternalServerError(detail)
    case "/errors/validation-error":
      return new ValidationError(detail)
    case "/errors/authentication-error":
      return new AuthError(detail)
    case "/errors/conflict":
      return new ConflictError(detail)
    default:
      return new InternalServerError(detail)
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
  private async _request<T, E = ApiError>(
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
      const data = (await response.json()) as ApiResult<T, E>

      if (data.isSuccess) {
        return data.data
      }
      throw createErrorFromProblemDocument(data.error as ApiError)
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
  public async createPerformance(performanceData: Partial<Performance>) {
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
  public async updatePerformance(id: number) {
    return this._request<
      Performance,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/performances/${id}`, "PUT")
  }

  /**
   * 공연 삭제
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deletePerformance(id: number) {
    return this._request<null, NotFoundError | InternalServerError>(
      `/api/performances/${id}`,
      "DELETE"
    )
  }

  /**
   * 팀 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {NotFoundError} 요청한 공연이 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createTeam(performanceId: number, teamData: Partial<Team>) {
    return this._request<
      Team,
      ValidationError | NotFoundError | InternalServerError
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
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateTeam(id: number, teamData: Partial<Team>) {
    return this._request<
      Team,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/teams/${id}`, "PUT", teamData)
  }

  /**
   * 팀 삭제
   * @throws {ForbiddenError} 팀 삭제 권한이 없는 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteTeam(id: number) {
    return this._request<
      null,
      ForbiddenError | NotFoundError | InternalServerError
    >(`/api/teams/${id}`, "DELETE")
  }

  /**
   * 팀에 지원
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ConflictError} 이미 지원한 팀인 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async applyToTeam(teamId: number): Promise<Team> {
    return this._request<
      Team,
      NotFoundError | ValidationError | ConflictError | InternalServerError
    >(`/api/teams/${teamId}/apply`, "POST")
  }

  /**
   * 팀 지원 취소
   * @throws {ValidationError} 지원하지 않은 팀인 경우
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async cancelTeamApplication(teamId: number): Promise<Team> {
    return this._request<
      Team,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/teams/${teamId}/cancel`, "POST")
  }

  /**
   * 기수 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createGeneration(generationData: Partial<Generation>) {
    return this._request<Generation, ValidationError | InternalServerError>(
      `/api/generations`,
      "POST",
      generationData
    )
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
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateGeneration(id: number) {
    return this._request<
      Generation,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/generations/${id}`, "PUT")
  }

  /**
   * 기수 삭제
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteGeneration(id: number) {
    return this._request<null, NotFoundError | InternalServerError>(
      `/api/generations/${id}`,
      "DELETE"
    )
  }

  /**
   * 세션 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createSession(sessionData: Partial<Session>) {
    return this._request<Session, ValidationError | InternalServerError>(
      `/api/sessions`,
      "POST",
      sessionData
    )
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
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateSession(id: number) {
    return this._request<
      Session,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/sessions/${id}`, "PUT")
  }

  /**
   * 세션 삭제
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteSession(id: number) {
    return this._request<null, NotFoundError | InternalServerError>(
      `/api/sessions/${id}`,
      "DELETE"
    )
  }

  /**
   * 유저 생성
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async createUser(userData: Partial<User>) {
    return this._request<User, ValidationError | InternalServerError>(
      `/api/users`,
      "POST",
      userData
    )
  }

  /**
   * 유저 정보 조회
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getUserById(id: number) {
    return this._request<User, NotFoundError | InternalServerError>(
      `/api/users/${id}`,
      "GET"
    )
  }

  /**
   * 유저 목록 조회
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async getUsers() {
    return this._request<User[], InternalServerError>(`/api/users`, "GET")
  }

  /**
   * 유저 수정
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {ValidationError} 입력값이 올바르지 않은 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async updateUser(id: number) {
    return this._request<
      User,
      NotFoundError | ValidationError | InternalServerError
    >(`/api/users/${id}`, "PUT")
  }

  /**
   * 유저 삭제
   * @throws {NotFoundError} 요청한 리소스가 존재하지 않는 경우
   * @throws {InternalServerError} 서버 오류 발생 시
   */
  public async deleteUser(id: number) {
    return this._request<null, NotFoundError | InternalServerError>(
      `/api/users/${id}`,
      "DELETE"
    )
  }

  /**
   * 회원가입
   * @throws {ValidationError}
   * @throws {ConflictError}
   * @throws {InternalServerError}
   */
  public async register(userData: CreateUser) {
    return this._request<
      User,
      ValidationError | ConflictError | InternalServerError
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
