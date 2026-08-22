export interface JwtPayload {
  sub: number
  iat?: number // issued at
  exp?: number // expiration time
}
