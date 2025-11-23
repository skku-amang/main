/* eslint-disable @typescript-eslint/no-empty-object-type */
export declare module "next-auth" {
  /**
   * `authorize` 함수 호출 시 반환하는 유저 객체의 타입
   */
  interface User extends AuthData {}

  /**
   * 클라이언트 컴포넌트에서 `useSession` 훅을 통해 접근하는 세션 객체의 타입
   */
  interface Session extends AuthData {}
}

export declare module "next-auth/jwt" {
  /**
   * 로그인 이후 모든 요청에서 사용
   */
  interface JWT extends AuthData {}
}

type AuthData = {
  id: string | undefined
  name: string
  nickname: string
  image?: string | null
  email: string
  isAdmin: boolean
  access: string
}
