export interface JwtPayload {
  sub: number
  sid: string // 로그인 세션(기기) ID — refresh 후에도 유지 (#541)
  iat?: number // issued at
  exp?: number // expiration time
}
