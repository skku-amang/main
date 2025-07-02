export type AuthData = {
  id: string | undefined;
  name: string;
  nickname: string;
  image?: string | null;
  email: string;
  position: string;
  is_admin: boolean;
  access: string;
  refresh: string;
};

export type NextAuthUser = AuthData;
export type NextAuthSession = AuthData;
export type NextAuthJWT = AuthData;
