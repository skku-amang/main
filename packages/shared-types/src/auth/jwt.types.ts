export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  isAdmin: boolean;
  iat?: number; // issued at
  exp?: number; // expiration time
}
