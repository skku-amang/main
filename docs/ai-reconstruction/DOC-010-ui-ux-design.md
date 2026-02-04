# DOC-010: UI/UX 설계 명세서

> AI 재구성을 위한 상세 명세

---

## 1. 개요

AMANG 프로젝트의 프론트엔드는 Next.js 14 App Router를 기반으로 하며, 라우트 그룹을 활용한 레이아웃 시스템과 Tailwind CSS를 사용한 디자인 시스템을 적용합니다.

---

## 2. 라우트 구조

### 2.1 전체 라우트 맵

```
apps/web/app/
├── layout.tsx                    # 루트 레이아웃 (Providers, Toaster)
├── globals.css                   # 전역 스타일, CSS 변수
├── login/
│   ├── layout.tsx
│   └── page.tsx                  # 로그인 페이지
├── test/
│   └── page.tsx                  # 테스트 페이지
├── (home)/
│   ├── layout.tsx                # 홈 레이아웃 (배경 이미지)
│   └── page.tsx                  # 랜딩 페이지 (/)
├── (general)/
│   ├── (light)/                  # 밝은 테마 레이아웃
│   │   ├── layout.tsx
│   │   ├── signup/
│   │   │   └── page.tsx          # 회원가입 (/signup)
│   │   ├── profile/
│   │   │   └── page.tsx          # 내 프로필 (/profile)
│   │   ├── members/
│   │   │   ├── page.tsx          # 회원 목록 (/members)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 회원 상세 (/members/:id)
│   │   │       └── edit/
│   │   │           └── page.tsx  # 회원 수정 (/members/:id/edit)
│   │   ├── notices/
│   │   │   ├── page.tsx          # 공지 목록 (/notices)
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # 공지 작성 (/notices/create)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 공지 상세 (/notices/:id)
│   │   │       └── edit/
│   │   │           └── page.tsx  # 공지 수정 (/notices/:id/edit)
│   │   ├── performances/
│   │   │   ├── page.tsx          # 공연 목록 (/performances)
│   │   │   ├── create/
│   │   │   │   └── page.tsx      # 공연 생성 (/performances/create)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 공연 상세 (/performances/:id)
│   │   │       ├── edit/
│   │   │       │   └── page.tsx  # 공연 수정 (/performances/:id/edit)
│   │   │       └── teams/
│   │   │           └── page.tsx  # 팀 목록 (/performances/:id/teams)
│   │   └── reservations/
│   │       ├── clubroom/
│   │       │   └── page.tsx      # 동아리방 예약
│   │       └── equipment/
│   │           └── page.tsx      # 장비 예약
│   └── (dark)/                   # 어두운 테마 레이아웃
│       └── performances/
│           └── [id]/
│               └── teams/
│                   ├── layout.tsx
│                   ├── create/
│                   │   └── page.tsx  # 팀 생성
│                   └── [teamId]/
│                       ├── page.tsx  # 팀 상세 (지원 페이지)
│                       └── edit/
│                           └── page.tsx  # 팀 수정
```

### 2.2 라우트 그룹 설명

| 그룹                | 경로                          | 목적                          | Header Mode   |
| ------------------- | ----------------------------- | ----------------------------- | ------------- |
| `(home)`            | `/`                           | 랜딩 페이지, 배경 이미지 사용 | `transparent` |
| `(general)/(light)` | 대부분의 페이지               | 목록, 관리 페이지             | `light`       |
| `(general)/(dark)`  | `/performances/.../teams/...` | 팀 상세, 지원 페이지          | `dark`        |

### 2.3 라우트 상수

**파일 경로**: `apps/web/constants/routes.ts`

```typescript
export const DEFAULT_PERFORMANCE_ID = 1;

const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    INDEX: "/admin",
  },
  NOTICE: {
    CREATE: "/notices/create",
    LIST: "/notices",
    DETAIL: (id: number) => `/notices/${id}`,
    EDIT: (id: number) => `/notices/${id}/edit`,
  },
  PERFORMANCE: {
    CREATE: "/performances/create",
    LIST: "/performances",
    DETAIL: (id: number) => `/performances/${id}`,
    TEAM: {
      CREATE: (performanceId: number) =>
        `/performances/${performanceId}/teams/create`,
      LIST: (id: number) => `/performances/${id}/teams`,
      DETAIL: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}`,
      EDIT: (performanceId: number, teamId: number) =>
        `/performances/${performanceId}/teams/${teamId}/edit`,
    },
    EDIT: (id: number) => `/performances/${id}/edit`,
  },
  MEMBER: {
    LIST: "/members",
    DETAIL: (id: number) => `/members/${id}`,
  },
  PROFILE: {
    INDEX: "/profile",
    TEAMS: "/profile/teams",
  },
  RESERVATION: {
    CLUBROOM: "/reservations/clubroom",
    EQUIPMENT: "/reservations/equipment",
  },
};

export default ROUTES;
```

---

## 3. 레이아웃 시스템

### 3.1 루트 레이아웃

**파일 경로**: `apps/web/app/layout.tsx`

```typescript
import "@/app/globals.css"

import { Metadata } from "next"
import localFont from "next/font/local"
import React from "react"

import { Toaster } from "@/components/ui/toaster"
import Providers from "@/lib/providers"
import { cn } from "@/lib/utils"

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard"
})

export const metadata: Metadata = {
  title: "AMANG",
  description: "SKKU AMANG official homepage",
  icons: {
    icon: "/favicon.ico"
  }
}

/**
 * Root layout 입니다.
 * Session, metadata, font 등 전역적인 설정을 적용합니다.
 * HTML, CSS 등 스타일 절대 적용 금지!
 * 개별 페이지의 레이아웃은 각 페이지에서 구현해주세요.
 */
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={cn(pretendard.className, "bg-neutral-50")}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
```

### 3.2 RootHeaderAndFooterWrapper

**파일 경로**: `apps/web/components/RootHeaderAndFooterWrapper.tsx`

모든 일반 페이지에서 사용하는 공통 레이아웃 래퍼입니다.

```typescript
import React from "react"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { cn } from "@/lib/utils"

export type HeaderMode = "light" | "dark" | "transparent"

type RootHeaderAndFooterWrapperProps = {
  children: React.ReactNode
  mainStyle?: React.CSSProperties
  mainClassName?: string
  paddingTopPixel?: number
  paddingBottomPixel?: number
  useHeader?: boolean
  headerMode?: HeaderMode
  headerHeightPixel?: number
}

const RootHeaderAndFooterWrapper = ({
  children,
  mainStyle,
  mainClassName = "container",
  paddingTopPixel = 0,
  paddingBottomPixel = 0,
  useHeader = true,
  headerMode = useHeader ? "light" : undefined
}: RootHeaderAndFooterWrapperProps) => {
  const headerHeightPixel = 48
  const footerHeightPixel = 120

  const toPixelString = (value: number) => `${value}px`

  return (
    <div className="h-screen">
      <Header
        position="fixed"
        height={toPixelString(headerHeightPixel)}
        mode={headerMode}
      />

      <main
        className={cn("h-auto min-h-full", mainClassName)}
        style={{
          paddingTop: toPixelString(headerHeightPixel + paddingTopPixel),
          paddingBottom: toPixelString(footerHeightPixel + paddingBottomPixel),
          ...mainStyle
        }}
      >
        {children}
      </main>

      <Footer height={toPixelString(footerHeightPixel)} />
    </div>
  )
}

export default RootHeaderAndFooterWrapper
```

### 3.3 라우트 그룹별 레이아웃

#### (light) 레이아웃

```typescript
// apps/web/app/(general)/(light)/layout.tsx
import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <RootHeaderAndFooterWrapper>{children}</RootHeaderAndFooterWrapper>
}
```

#### (dark) 레이아웃

```typescript
// apps/web/app/(general)/(dark)/performances/[id]/teams/layout.tsx
import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootHeaderAndFooterWrapper headerMode="dark">
      {children}
    </RootHeaderAndFooterWrapper>
  )
}
```

#### (home) 레이아웃

```typescript
// apps/web/app/(home)/layout.tsx
import RootHeaderAndFooterWrapper from "@/components/RootHeaderAndFooterWrapper"

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RootHeaderAndFooterWrapper
      headerMode="transparent"
      mainStyle={{
        backgroundImage: `url('/Music band_pixabay 1.png')`,
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
      mainClassName=""
    >
      {children}
    </RootHeaderAndFooterWrapper>
  )
}
```

---

## 4. 헤더 컴포넌트

### 4.1 Header 컴포넌트

**파일 경로**: `apps/web/components/Header/index.tsx`

```typescript
"use client"

import { Knewave } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

import MobileBackButton from "@/components/Header/_component/MobileBackButton"
import Sidebar from "@/components/Header/_component/Sidebar"
import ROUTES, { DEFAULT_PERFORMANCE_ID } from "@/constants/routes"
import { cn } from "@/lib/utils"

import NavLink from "../NavLink"
import Profile from "./_component/Profile"

const knewave = Knewave({ subsets: ["latin"], weight: ["400"] })

export type HeaderMode = "light" | "dark" | "transparent"

type MenuItem = {
  name: string
  url: string
  active: boolean
  experimental?: boolean
}

const Header = ({
  position,
  height = "82px",
  mode = "light"
}: {
  position: "sticky" | "fixed"
  height: string
  mode?: HeaderMode
}) => {
  const menuItems: MenuItem[] = [
    { name: "소개", url: ROUTES.HOME, active: false, experimental: true },
    { name: "신청", url: ROUTES.HOME, active: false, experimental: true },
    { name: "모집", url: ROUTES.HOME, active: false, experimental: true },
    {
      name: "예약",
      url: ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID),
      active: true
    },
    {
      name: "동방",
      url: ROUTES.RESERVATION.CLUBROOM,
      active: true,
      experimental: true
    },
    {
      name: "장비",
      url: ROUTES.RESERVATION.EQUIPMENT,
      active: true,
      experimental: true
    },
    { name: "아카이브", url: ROUTES.PERFORMANCE.LIST, active: true }
  ]

  return (
    <header
      className={cn(
        position,
        "top-0 z-50 flex h-full w-full justify-center backdrop-blur-sm",
        {
          "bg-white": mode === "light",
          "bg-primary": mode === "dark",
          "bg-transparent": mode === "transparent"
        }
      )}
      style={{ height }}
    >
      {/* Mobile */}
      <nav className={cn(
        "visible relative flex h-full w-full items-center justify-between px-10 py-2 md:hidden",
        {
          "bg-white": mode === "light",
          "bg-primary": mode === "dark",
          "bg-transparent": mode === "transparent"
        }
      )}>
        <MobileBackButton />
        <Link href={ROUTES.HOME}>
          <Image src="/Logo.png" alt="logo" width={32} height={32} />
        </Link>
        <Sidebar />
      </nav>

      {/* Tablet & Desktop */}
      <nav className="hidden h-full w-full items-center justify-between px-[87px] py-[21px] md:visible md:flex">
        <Link
          href={ROUTES.HOME}
          className={cn("text-[35px]", knewave.className, {
            "text-white": mode === "transparent" || mode === "dark",
            "text-primary": mode === "light"
          })}
        >
          Amang
        </Link>

        <div className="flex items-center justify-end gap-x-[35px]">
          <div className="flex h-full justify-center gap-x-9">
            {menuItems.map((menuItem) => (
              <NavLink
                key={menuItem.name}
                href={menuItem.url}
                isActive={menuItem.active}
                mode={mode}
                isAdminOnly={menuItem.experimental}
              >
                {menuItem.name}
              </NavLink>
            ))}
          </div>

          <Profile />
        </div>
      </nav>
    </header>
  )
}

export default Header
```

### 4.2 Header Mode 스타일

| Mode          | 배경색           | 텍스트 색      | 사용 페이지     |
| ------------- | ---------------- | -------------- | --------------- |
| `light`       | `bg-white`       | `text-primary` | 대부분의 페이지 |
| `dark`        | `bg-primary`     | `text-white`   | 팀 상세 페이지  |
| `transparent` | `bg-transparent` | `text-white`   | 랜딩 페이지     |

---

## 5. 페이지 헤더 컴포넌트

### 5.1 DefaultPageHeader

목록 페이지에서 사용하는 기본 페이지 헤더입니다.

**파일 경로**: `apps/web/components/PageHeaders/Default/index.tsx`

```typescript
import { Home } from "lucide-react"

import DefaultPageHeaderBreadCrumb from "@/components/PageHeaders/Default/BreadCrumb"
import { cn } from "@/lib/utils"

export type DefaultPageHeaderBreadCrumbRoute = {
  display: React.ReactNode
  href?: string
}

export const DefaultHomeIcon = () => {
  return <Home size={20} strokeWidth={1.67} />
}

interface DefaultPageHeaderProps {
  title: React.ReactNode
  routes?: DefaultPageHeaderBreadCrumbRoute[]
  className?: string
}

const DefaultPageHeader = ({
  title,
  routes = [],
  className
}: DefaultPageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center space-y-1 pb-2 pt-10 text-center md:space-y-5 md:pb-[91px] md:pt-[135px]",
        className
      )}
    >
      <h1 className="text-[22px] font-semibold md:text-5xl">{title}</h1>
      {routes.length > 0 && <DefaultPageHeaderBreadCrumb routes={routes} />}
    </div>
  )
}

export default DefaultPageHeader
```

### 5.2 OleoPageHeader

팀 상세 페이지에서 사용하는 특수 페이지 헤더입니다.

**파일 경로**: `apps/web/components/PageHeaders/OleoPageHeader.tsx`

```typescript
import { ChevronLeft } from "lucide-react"
import { Oleo_Script } from "next/font/google"
import Link from "next/link"

import { cn } from "@/lib/utils"

const oleoScript = Oleo_Script({ subsets: ["latin"], weight: ["400"] })

interface OleoPageHeaderProps {
  title: string
  goBackHref?: string
  className?: string
}

const OleoPageHeader = ({
  title,
  goBackHref,
  className
}: OleoPageHeaderProps) => {
  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      {goBackHref && (
        <Link
          href={goBackHref}
          className="absolute left-4 flex items-center text-white hover:underline md:left-[87px]"
        >
          <ChevronLeft className="mr-1" />
          <span className="hidden md:inline">뒤로가기</span>
        </Link>
      )}
      <h1
        className={cn(
          "text-center text-[32px] text-white md:text-[64px]",
          oleoScript.className
        )}
      >
        {title}
      </h1>
    </div>
  )
}

export default OleoPageHeader
```

---

## 6. 반응형 디자인

### 6.1 브레이크포인트

Tailwind CSS 기본 브레이크포인트 사용:

| 이름  | 최소 너비 | 적용 대상   |
| ----- | --------- | ----------- |
| 기본  | 0px       | 모바일      |
| `md`  | 768px     | 태블릿      |
| `lg`  | 1024px    | 데스크탑    |
| `xl`  | 1280px    | 대형 화면   |
| `2xl` | 1536px    | 초대형 화면 |

### 6.2 컨테이너 설정

```typescript
// tailwind.config.ts
container: {
  center: true,
  padding: "1.5rem",
  screens: {
    "2xl": "1400px"
  }
}
```

### 6.3 반응형 패턴 예시

```typescript
// 그리드 레이아웃
<div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
  {/* items */}
</div>

// 모바일/데스크탑 분기
<nav className="visible md:hidden">  {/* 모바일만 */}
<nav className="hidden md:flex">     {/* 태블릿 이상 */}

// 텍스트 크기
<h1 className="text-[22px] md:text-5xl">

// 패딩/마진
<div className="px-4 md:px-[87px]">
```

---

## 7. 디자인 시스템

### 7.1 색상 시스템 (CSS 변수)

**파일 경로**: `apps/web/app/globals.css`

```css
@layer base {
  :root {
    /* 배경/전경 */
    --background: 0 0% 100%;
    --foreground: 208 84% 4.9%;

    /* 카드 */
    --card: 0 0% 100%;
    --card-foreground: 208 84% 4.9%;

    /* 팝오버 */
    --popover: 0 0% 100%;
    --popover-foreground: 208 84% 4.9%;

    /* 주요 색상 (네이비 블루 계열) */
    --primary: 208 96% 20%; /* 진한 네이비 */
    --primary-foreground: 210 40% 98%;

    /* 보조 색상 (블루) */
    --secondary: 221 83% 53%;
    --secondary-foreground: 208 96% 20%;

    /* 3차 색상 */
    --third: 217 91% 60%;

    /* 뮤트/악센트 */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 208 96% 20%;

    /* 경고 색상 */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    /* 테두리/입력 */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 217 91% 60%;

    /* 기타 */
    --radius: 0.5rem;
  }

  .dark {
    --background: 208 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... 다크 모드 변수 ... */
  }
}
```

### 7.2 Tailwind 확장 색상

**파일 경로**: `apps/web/tailwind.config.ts`

```typescript
colors: {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  mainText: "hsl(var(--main-text))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))"
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))"
  },
  third: {
    DEFAULT: "hsl(var(--third))"
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))"
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))"
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))"
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))"
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))"
  }
}
```

### 7.3 폰트 시스템

```typescript
// 메인 폰트: Pretendard (한글)
const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

// 로고 폰트: Knewave (라틴)
const knewave = Knewave({ subsets: ["latin"], weight: ["400"] });

// 특수 헤더 폰트: Oleo Script
const oleoScript = Oleo_Script({ subsets: ["latin"], weight: ["400"] });
```

### 7.4 그림자 시스템

```typescript
boxShadow: {
  custom: "0 4px 4px rgba(0, 0, 0, 0.25)",
  checkbox: "0 4px 10px rgba(155, 169, 176, 0.2)"
},
dropShadow: {
  search: "0 1px 2px rgba(64, 63, 84, 0.1)",
  filterMobile: "0 2px 6px (02, 36, 64, 0.04)",
  table: "0 1px 2px rgba(0, 0, 0, 0.06)"
}
```

---

## 8. 페이지별 컴포넌트 구조

### 8.1 목록 페이지 패턴 (performances/page.tsx)

```typescript
"use client"

import Link from "next/link"
import { CiCirclePlus } from "react-icons/ci"

import PerformanceCard from "@/app/(general)/(light)/performances/_components/PerformanceCard"
import DefaultPageHeader, { DefaultHomeIcon } from "@/components/PageHeaders/Default"
import Search from "@/components/Search"
import { Button } from "@/components/ui/button"
import ROUTES from "@/constants/routes"
import { usePerformances } from "@/hooks/api/usePerformance"

const PerformanceList = () => {
  const { data: performances } = usePerformances()

  return (
    <div>
      {/* 페이지 헤더 + Breadcrumb */}
      <DefaultPageHeader
        title="공연 목록"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "아카이브" },
          { display: "공연 목록", href: ROUTES.PERFORMANCE.LIST }
        ]}
      />

      {/* 도구 모음 (검색 + 추가 버튼) */}
      <div className="mb-3 flex justify-between gap-x-2">
        <Search />
        <Button asChild className="flex items-center">
          <Link href={ROUTES.PERFORMANCE.CREATE}>
            <CiCirclePlus size={20} />
            &nbsp;추가
          </Link>
        </Button>
      </div>

      {/* 그리드 카드 목록 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {performances === undefined ? (
          <div>Loading...</div>
        ) : (
          performances.map((p) => (
            <PerformanceCard
              key={p.id}
              id={p.id}
              name={p.name}
              posterSrc={p.posterImage}
              location={p.location}
              startAt={p.startAt}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PerformanceList
```

### 8.2 상세 페이지 패턴 (teams/[teamId]/page.tsx)

```typescript
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import Loading from "@/app/_(errors)/Loading"
import NotFoundPage from "@/app/_(errors)/NotFound"
import OleoPageHeader from "@/components/PageHeaders/OleoPageHeader"
import ROUTES from "@/constants/routes"
import { useTeam } from "@/hooks/api/useTeam"

interface TeamDetailProps {
  params: {
    id: string
    teamId: string
  }
}

const TeamDetail = (props: TeamDetailProps) => {
  const session = useSession()
  const router = useRouter()

  const performanceId = Number(props.params.id)
  const id = Number(props.params.teamId)

  const { data: team, isLoading, isError } = useTeam(id)

  // 인증 체크
  if (session.status === "unauthenticated") router.push(ROUTES.LOGIN)

  // 로딩/에러/404 처리
  if (isLoading) return <Loading />
  if (isError) return <div>Error</div>
  if (!team) return <NotFoundPage />

  return (
    <div className="container flex w-full flex-col items-center px-0 pt-16">
      {/* 배경 장식 */}
      <div className="absolute left-0 top-0 z-0 h-[283px] w-full bg-slate-300 md:h-[600px]"
           style={{ clipPath: "polygon(0 0%, 80% 0, 180% 65%, 0% 100%)" }} />
      <div className="absolute left-0 top-0 h-[283px] w-full bg-primary md:h-[600px]"
           style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0% 100%)" }} />

      {/* 페이지 헤더 */}
      <OleoPageHeader
        title="Join Your Team"
        goBackHref={ROUTES.PERFORMANCE.TEAM.LIST(performanceId)}
        className="relative mb-10"
      />

      {/* 메인 컨텐츠 */}
      {/* ... */}
    </div>
  )
}

export default TeamDetail
```

### 8.3 폼 페이지 패턴

```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createPerformanceSchema } from "@repo/shared-types"

const CreatePerformance = () => {
  const form = useForm({
    resolver: zodResolver(createPerformanceSchema),
    defaultValues: { /* ... */ }
  })

  const onSubmit = async (data) => {
    // mutation 호출
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>공연명</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">생성</Button>
      </form>
    </Form>
  )
}
```

---

## 9. 에러 페이지

### 9.1 Loading 컴포넌트

**파일 경로**: `apps/web/app/_(errors)/Loading.tsx`

```typescript
const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary" />
    </div>
  )
}

export default Loading
```

### 9.2 NotFound 컴포넌트

**파일 경로**: `apps/web/app/_(errors)/NotFound.tsx`

```typescript
const NotFoundPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-gray-600">페이지를 찾을 수 없습니다</p>
    </div>
  )
}

export default NotFoundPage
```

---

## 10. 네비게이션 메뉴 구조

### 10.1 메인 메뉴 항목

```typescript
const menuItems: MenuItem[] = [
  { name: "소개", url: ROUTES.HOME, active: false, experimental: true },
  { name: "신청", url: ROUTES.HOME, active: false, experimental: true },
  { name: "모집", url: ROUTES.HOME, active: false, experimental: true },
  {
    name: "예약",
    url: ROUTES.PERFORMANCE.TEAM.LIST(DEFAULT_PERFORMANCE_ID),
    active: true,
  },
  {
    name: "동방",
    url: ROUTES.RESERVATION.CLUBROOM,
    active: true,
    experimental: true,
  },
  {
    name: "장비",
    url: ROUTES.RESERVATION.EQUIPMENT,
    active: true,
    experimental: true,
  },
  { name: "아카이브", url: ROUTES.PERFORMANCE.LIST, active: true },
];
```

| 메뉴명   | 활성화 | 실험적 | 설명                 |
| -------- | ------ | ------ | -------------------- |
| 소개     | ❌     | ✅     | 동아리 소개 (미구현) |
| 신청     | ❌     | ✅     | 가입 신청 (미구현)   |
| 모집     | ❌     | ✅     | 모집 공고 (미구현)   |
| 예약     | ✅     | ❌     | 팀 목록으로 이동     |
| 동방     | ✅     | ✅     | 동아리방 예약        |
| 장비     | ✅     | ✅     | 장비 예약            |
| 아카이브 | ✅     | ❌     | 공연 목록            |

---

## 11. AI 구현 체크리스트

### 11.1 라우트 생성 시

- [ ] `app/` 디렉토리 구조 준수
- [ ] 적절한 라우트 그룹 선택 `(light)` 또는 `(dark)`
- [ ] `page.tsx` 파일 생성
- [ ] 동적 라우트는 `[param]` 형식 사용
- [ ] `ROUTES` 상수에 경로 추가

### 11.2 레이아웃 생성 시

- [ ] `RootHeaderAndFooterWrapper` 사용
- [ ] `headerMode` 적절히 설정
- [ ] `mainClassName` 기본값 "container"

### 11.3 페이지 컴포넌트 작성 시

- [ ] `"use client"` 지시문 (hooks 사용 시)
- [ ] 적절한 페이지 헤더 컴포넌트 사용
- [ ] Loading/Error/NotFound 상태 처리
- [ ] 인증 필요 시 session 체크

### 11.4 스타일 적용 시

- [ ] Tailwind CSS 클래스 사용
- [ ] CSS 변수 색상 사용 (primary, secondary 등)
- [ ] 반응형 클래스 적용 (md:, lg:, xl:)
- [ ] `cn()` 유틸리티로 조건부 클래스

---

## 12. 관련 파일 목록

| 파일 경로                                            | 역할               |
| ---------------------------------------------------- | ------------------ |
| `apps/web/app/layout.tsx`                            | 루트 레이아웃      |
| `apps/web/app/globals.css`                           | 전역 CSS, 변수     |
| `apps/web/tailwind.config.ts`                        | Tailwind 설정      |
| `apps/web/constants/routes.ts`                       | 라우트 상수        |
| `apps/web/components/RootHeaderAndFooterWrapper.tsx` | 공통 레이아웃 래퍼 |
| `apps/web/components/Header/index.tsx`               | 헤더 컴포넌트      |
| `apps/web/components/PageHeaders/Default/index.tsx`  | 기본 페이지 헤더   |
| `apps/web/components/PageHeaders/OleoPageHeader.tsx` | 특수 페이지 헤더   |
| `apps/web/app/_(errors)/Loading.tsx`                 | 로딩 컴포넌트      |
| `apps/web/app/_(errors)/NotFound.tsx`                | 404 컴포넌트       |
