# DOC-008: 인증/인가 시스템 설계서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 JWT 인증, 토큰 갱신, Guard 시스템을 정확하게 구현할 수 있도록 상세 명세

---

## 1. 인증 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                            │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │   next-auth v5   │    │   ApiClient      │    │  SessionProvider │  │
│  │  Credentials     │───▶│  Bearer Token    │◀───│  Token Storage   │  │
│  │  Provider        │    │  Auto Refresh    │    │                  │  │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP + Authorization Header
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend (NestJS)                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │ AccessTokenGuard │───▶│   JWT Strategy   │───▶│   AuthService    │  │
│  │ (@UseGuards)     │    │  Token Verify    │    │  Token Issue     │  │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘  │
│                                                           │             │
│  ┌──────────────────┐    ┌──────────────────┐            ▼             │
│  │   AdminGuard     │    │ TeamOwnerGuard   │    ┌──────────────────┐  │
│  │   isAdmin check  │    │ leader check     │    │   PostgreSQL     │  │
│  └──────────────────┘    └──────────────────┘    │  hashedRefresh   │  │
│                                                   └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. JWT 토큰 구조

### 2.1 Access Token

**용도**: API 요청 인증

```typescript
// Payload
{
  sub: number; // userId
  email: string;
  name: string;
  isAdmin: boolean;
  iat: number; // 발급 시간
  exp: number; // 만료 시간
}
```

**설정**:
| 항목 | 환경변수 | 예시 값 |
|------|---------|--------|
| Secret | ACCESS_TOKEN_SECRET | 랜덤 문자열 (32자 이상) |
| 만료 시간 | ACCESS_TOKEN_EXPIRES_IN | 3600 (초) = 1시간 |

### 2.2 Refresh Token

**용도**: Access Token 갱신

```typescript
// Payload
{
  sub: number;
  email: string;
  name: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}
```

**설정**:
| 항목 | 환경변수 | 예시 값 |
|------|---------|--------|
| Secret | REFRESH_TOKEN_SECRET | 랜덤 문자열 (32자 이상) |
| 만료 시간 | REFRESH_TOKEN_EXPIRES_IN | 604800 (초) = 7일 |

**저장**:

- 클라이언트: 메모리 또는 HttpOnly 쿠키
- 서버: User.hashedRefreshToken (bcrypt 해시)

---

## 3. 인증 플로우

### 3.1 회원가입 플로우

```
1. Client: POST /auth/signup { email, password, ... }
   │
2. Server: AuthService.signUp()
   │
3. 검증:
   │  ├─ 이메일 중복 확인
   │  └─ 닉네임 중복 확인
   │
4. 비밀번호 해시: bcrypt.hash(password, 10)
   │
5. User 생성: prisma.user.create()
   │
6. 토큰 발급: getTokens(userId, email, name, isAdmin)
   │  ├─ accessToken = jwt.sign({ sub, email, name, isAdmin }, ACCESS_SECRET)
   │  └─ refreshToken = jwt.sign({ sub, email, name, isAdmin }, REFRESH_SECRET)
   │
7. Refresh Token 저장:
   │  hashedRefreshToken = bcrypt.hash(refreshToken, 10)
   │  prisma.user.update({ hashedRefreshToken })
   │
8. Response: { user, accessToken, refreshToken, expiresIn }
```

### 3.2 로그인 플로우

```
1. Client: POST /auth/login { email, password }
   │
2. Server: AuthService.login()
   │
3. 사용자 조회: prisma.user.findUnique({ where: { email } })
   │  └─ 없으면: throw AuthError("잘못된 이메일 또는 비밀번호")
   │
4. 비밀번호 검증: bcrypt.compare(password, user.password)
   │  └─ 불일치: throw AuthError("잘못된 이메일 또는 비밀번호")
   │
5. 토큰 발급 및 저장 (회원가입과 동일)
   │
6. Response: { user, accessToken, refreshToken, expiresIn }
```

### 3.3 토큰 갱신 플로우

```
1. Client: POST /auth/refresh { refreshToken }
   │
2. Server: AuthService.refreshTokens()
   │
3. Refresh Token 디코딩: jwt.verify(refreshToken, REFRESH_SECRET)
   │  └─ 만료/무효: throw RefreshTokenExpiredError
   │
4. 사용자 조회: prisma.user.findUnique({ where: { id: payload.sub } })
   │
5. 저장된 해시와 비교: bcrypt.compare(refreshToken, user.hashedRefreshToken)
   │  └─ 불일치: throw AuthError("유효하지 않은 토큰")
   │
6. 새 토큰 발급 및 저장
   │
7. Response: { accessToken, refreshToken, expiresIn }
```

### 3.4 로그아웃 플로우

```
1. Client: POST /auth/logout (with Authorization header)
   │
2. Server: AuthService.logout()
   │
3. hashedRefreshToken 제거:
   │  prisma.user.update({ hashedRefreshToken: null })
   │
4. Response: { message: "로그아웃 성공" }
```

---

## 4. NestJS Guard 시스템

### 4.1 AccessTokenGuard (기본)

```typescript
// apps/api/src/auth/guards/access-token.guard.ts
@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // @Public() 데코레이터가 있으면 인증 생략
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (info instanceof TokenExpiredError) {
      throw new AccessTokenExpiredError();
    }
    if (err || !user) {
      throw new AuthError("인증에 실패했습니다.");
    }
    return user;
  }
}
```

**글로벌 적용** (app.module.ts):

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AccessTokenGuard,
  },
],
```

### 4.2 @Public() 데코레이터

```typescript
// apps/api/src/auth/decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// 사용 예
@Public()
@Get()
findAll() { ... }
```

### 4.3 AdminGuard

```typescript
// apps/api/src/auth/guards/admin.guard.ts
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isAdmin) {
      throw new ForbiddenError("관리자 권한이 필요합니다.");
    }

    return true;
  }
}

// 사용 예
@UseGuards(AdminGuard)
@Post()
create(@Body() dto: CreatePerformanceDto) { ... }
```

### 4.4 TeamOwnerGuard

```typescript
// apps/api/src/auth/guards/team-owner.guard.ts
@Injectable()
export class TeamOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = parseInt(request.params.id, 10);

    // 관리자는 항상 허용
    if (user.isAdmin) {
      return true;
    }

    // 팀 리더인지 확인
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { leaderId: true },
    });

    if (!team) {
      throw new NotFoundError("팀을 찾을 수 없습니다.");
    }

    if (team.leaderId !== user.sub) {
      throw new ForbiddenError("팀 수정 권한이 없습니다.");
    }

    return true;
  }
}
```

### 4.5 RentalOwnerGuard

```typescript
// apps/api/src/auth/guards/rental-owner.guard.ts
@Injectable()
export class RentalOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const rentalId = parseInt(request.params.id, 10);

    if (user.isAdmin) {
      return true;
    }

    const rental = await this.prisma.equipmentRental.findUnique({
      where: { id: rentalId },
      include: { users: { select: { id: true } } },
    });

    if (!rental) {
      throw new NotFoundError("대여 기록을 찾을 수 없습니다.");
    }

    const isOwner = rental.users.some((u) => u.id === user.sub);
    if (!isOwner) {
      throw new ForbiddenError("대여 수정 권한이 없습니다.");
    }

    return true;
  }
}
```

---

## 5. Passport JWT Strategy

### 5.1 Access Token Strategy

```typescript
// apps/api/src/auth/strategies/access-token.strategy.ts
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("ACCESS_TOKEN_SECRET"),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // req.user에 주입됨
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      isAdmin: payload.isAdmin,
    };
  }
}
```

### 5.2 Refresh Token Strategy

```typescript
// apps/api/src/auth/strategies/refresh-token.strategy.ts
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      secretOrKey: configService.get<string>("REFRESH_TOKEN_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.body.refreshToken;
    return { ...payload, refreshToken };
  }
}
```

---

## 6. 프론트엔드 인증 (next-auth)

### 6.1 auth.ts 설정

```typescript
// apps/web/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        // 회원가입용 추가 필드
        name: { type: "text" },
        nickname: { type: "text" },
        generationId: { type: "number" },
        sessions: { type: "text" }, // JSON string
      },
      async authorize(credentials) {
        const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);

        // 회원가입 모드
        if (credentials.name && credentials.nickname) {
          const result = await apiClient.signup({
            email: credentials.email,
            password: credentials.password,
            name: credentials.name,
            nickname: credentials.nickname,
            generationId: Number(credentials.generationId),
            sessions: JSON.parse(credentials.sessions),
          });
          return {
            id: String(result.user.id),
            ...result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: Date.now() + result.expiresIn * 1000,
          };
        }

        // 로그인 모드
        const result = await apiClient.login({
          email: credentials.email,
          password: credentials.password,
        });
        return {
          id: String(result.user.id),
          ...result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: Date.now() + result.expiresIn * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 최초 로그인 시
      if (user) {
        return {
          ...token,
          ...user,
        };
      }

      // 토큰 만료 확인 (10초 여유)
      if (Date.now() < token.expiresIn - 10000) {
        return token;
      }

      // 토큰 갱신
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub,
        name: token.name,
        email: token.email,
        nickname: token.nickname,
        isAdmin: token.isAdmin,
      };
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});

async function refreshAccessToken(token) {
  try {
    const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);
    const result = await apiClient.refreshToken(token.refreshToken);

    return {
      ...token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: Date.now() + result.expiresIn * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
```

### 6.2 타입 확장

```typescript
// apps/web/types/auth.d.ts
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    nickname: string;
    isAdmin: boolean;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      nickname: string;
      isAdmin: boolean;
    };
    accessToken: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    name: string;
    email: string;
    nickname: string;
    isAdmin: boolean;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    error?: string;
  }
}
```

---

## 7. ApiClient 토큰 관리

```typescript
// apps/web/lib/providers/api-client-provider.tsx
export function ApiClientProvider({ children, session }) {
  const apiClient = useMemo(() => {
    const client = new ApiClient(process.env.NEXT_PUBLIC_API_URL!);

    // 액세스 토큰 설정
    if (session?.accessToken) {
      client.setAccessToken(session.accessToken);
    }

    // 토큰 만료 핸들러 설정
    client.setOnTokenExpired(async () => {
      // next-auth 세션 갱신 트리거
      const newSession = await update();
      return newSession?.accessToken || null;
    });

    return client;
  }, [session?.accessToken]);

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
}
```

---

## 8. 보호된 라우트 (미들웨어)

```typescript
// apps/web/middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/performances") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/admin");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/performances/:path*",
    "/profile/:path*",
    "/teams/:path*",
  ],
};
```

---

## 9. 환경변수 요약

| 변수                     | 앱  | 설명                         |
| ------------------------ | --- | ---------------------------- |
| ACCESS_TOKEN_SECRET      | api | JWT 액세스 토큰 서명 키      |
| ACCESS_TOKEN_EXPIRES_IN  | api | 액세스 토큰 만료 시간 (초)   |
| REFRESH_TOKEN_SECRET     | api | JWT 리프레시 토큰 서명 키    |
| REFRESH_TOKEN_EXPIRES_IN | api | 리프레시 토큰 만료 시간 (초) |
| AUTH_SECRET              | web | next-auth 세션 암호화 키     |
| NEXT_PUBLIC_API_URL      | web | API 서버 URL                 |

---

## 10. 참조 문서

| 문서 ID | 문서명    | 관계            |
| ------- | --------- | --------------- |
| DOC-007 | API 명세  | 엔드포인트 상세 |
| DOC-009 | 에러 처리 | 인증 관련 에러  |
