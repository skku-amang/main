export type AuthData = {
  id: string | undefined
  name: string
  nickname: string
  image?: string | null
  email: string
  isAdmin: boolean
  access: string
  refresh: string
}

export declare module "next-auth" {
  interface User extends AuthData {}
  interface Session extends AuthData {}
}

export declare module "@auth/core/jwt" {
  interface JWT extends AuthData {}
}
