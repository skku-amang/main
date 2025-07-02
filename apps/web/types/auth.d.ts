import type { AuthData } from "shared-types"

declare module "next-auth" {
  interface User extends AuthData {}
  interface Session extends AuthData {}
}

declare module "@auth/core/jwt" {
  interface JWT extends AuthData {}
}
