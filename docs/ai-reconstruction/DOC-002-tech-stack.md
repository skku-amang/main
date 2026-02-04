# DOC-002: 기술 스택 결정 문서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 프로젝트 재구성 시 동일한 기술 스택을 사용할 수 있도록 기술 선택의 이유와 버전을 명세

---

## 1. 기술 선택 원칙

### 1.1 핵심 원칙

1. **타입 안전성 우선**: 런타임 에러를 컴파일 타임에 방지
2. **코드 공유 최대화**: 프론트엔드/백엔드 간 타입, 스키마 공유
3. **생산성과 확장성의 균형**: 빠른 개발과 유지보수 용이성
4. **커뮤니티 지원**: 활발한 생태계와 문서화

### 1.2 의사결정 매트릭스

각 기술 선택 시 다음 기준으로 평가:

| 기준            | 가중치 | 설명                   |
| --------------- | ------ | ---------------------- |
| 타입 안전성     | 25%    | TypeScript 통합 수준   |
| 생태계/커뮤니티 | 20%    | 라이브러리, 문서, 지원 |
| 성능            | 15%    | 빌드/런타임 성능       |
| 학습 곡선       | 15%    | 팀원 적응 용이성       |
| 유지보수성      | 15%    | 장기 운영 비용         |
| 미래 호환성     | 10%    | 기술 성숙도, 로드맵    |

---

## 2. 런타임 환경

### 2.1 Node.js

| 항목      | 값      |
| --------- | ------- |
| 선택      | Node.js |
| 최소 버전 | >= 18   |
| 권장 버전 | 20 LTS  |

**선택 이유**:

- JavaScript/TypeScript 네이티브 런타임
- 프론트엔드(Next.js)와 백엔드(NestJS) 통합
- NPM 생태계 활용

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Deno | 보안, TS 네이티브 | 생태계 미성숙 | 제외 |
| Bun | 빠른 속도 | 호환성 이슈 | 제외 |

---

## 3. 모노레포 도구

### 3.1 Turborepo + pnpm

| 항목          | 값        |
| ------------- | --------- |
| 빌드 도구     | Turborepo |
| 버전          | 2.5.4     |
| 패키지 매니저 | pnpm      |
| 버전          | 10.13.1   |

**선택 이유**:

1. **빌드 캐싱**: 변경된 패키지만 재빌드
2. **병렬 실행**: 독립적인 태스크 동시 실행
3. **workspace 프로토콜**: `workspace:*`로 내부 패키지 참조
4. **디스크 효율성**: pnpm의 심볼릭 링크 + 하드 링크

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Nx | 강력한 분석 도구 | 복잡한 설정, 무거움 | 제외 |
| Lerna | 단순함 | 유지보수 우려, 캐싱 약함 | 제외 |
| npm workspaces | 별도 도구 불필요 | 캐싱 없음, 느림 | 제외 |
| yarn workspaces | PnP 지원 | 호환성 이슈 | 제외 |

**Turborepo 설정 (turbo.json)**:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "persistent": true,
      "cache": false
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "persistent": true
    },
    "check-types": {
      "dependsOn": ["^check-types", "^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:deploy": {
      "cache": false
    },
    "db:seed": {
      "dependsOn": ["^db:generate", "^db:migrate"],
      "cache": false
    }
  },
  "globalEnv": [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_API_URL"
  ]
}
```

---

## 4. 프론트엔드 기술 스택

### 4.1 프레임워크: Next.js 14

| 항목   | 값         |
| ------ | ---------- |
| 선택   | Next.js    |
| 버전   | 14.2.35    |
| 라우터 | App Router |
| React  | 18.3.1     |

**선택 이유**:

1. **App Router**: 레이아웃 중첩, 라우트 그룹, 서버 컴포넌트
2. **파일 기반 라우팅**: 직관적인 구조
3. **SSR/SSG/ISR**: 다양한 렌더링 전략
4. **Vercel 통합**: 배포 최적화

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Remix | 데이터 로딩 우수 | 생태계 작음 | 제외 |
| Vite + React | 빠른 HMR | SSR 설정 복잡 | 제외 |
| Create React App | 단순함 | SSR 미지원, 유지보수 중단 | 제외 |

### 4.2 상태 관리: TanStack Query

| 항목     | 값                           |
| -------- | ---------------------------- |
| 선택     | TanStack Query (React Query) |
| 버전     | 5.81.5                       |
| DevTools | 5.81.5                       |

**선택 이유**:

1. **서버 상태 전문**: 캐싱, 재검증, 동기화
2. **자동 타입 추론**: 타입스크립트 우선 설계
3. **선언적 API**: useQuery, useMutation
4. **DevTools**: 개발 시 캐시 상태 확인

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| SWR | 단순함 | 기능 부족 (mutation 약함) | 제외 |
| Redux Toolkit Query | Redux 통합 | 보일러플레이트 많음 | 제외 |
| Zustand | 가벼움 | 서버 상태 전용 아님 | 제외 |

### 4.3 인증: next-auth v5

| 항목     | 값                  |
| -------- | ------------------- |
| 선택     | next-auth (Auth.js) |
| 버전     | 5.0.0-beta.20       |
| Provider | Credentials         |

**선택 이유**:

1. **Next.js 네이티브**: 미들웨어, API 라우트 통합
2. **JWT 커스터마이징**: access/refresh 토큰 관리 가능
3. **TypeScript 지원**: Session, JWT 타입 확장

**주의사항**:

- v5는 베타 버전이나 안정적으로 사용 가능
- Credentials Provider 사용 (자체 인증 서버)

### 4.4 UI 라이브러리: shadcn/ui + Tailwind CSS

| 항목     | 값                   |
| -------- | -------------------- |
| 컴포넌트 | shadcn/ui            |
| 스타일링 | Tailwind CSS 3.4.1   |
| 기반     | Radix UI             |
| 아이콘   | Lucide React 0.424.0 |

**선택 이유**:

1. **복사 가능한 컴포넌트**: node_modules가 아닌 프로젝트 내 소스
2. **커스터마이징 용이**: 직접 수정 가능
3. **Radix UI 기반**: 접근성 보장
4. **Tailwind 통합**: 일관된 스타일링

**주요 컴포넌트**:

- Button, Input, Label, Textarea
- Card, Badge, Avatar
- Dialog, Sheet, Popover
- Table, Tabs, Select
- Form (React Hook Form 통합)
- Calendar, DateTimePicker

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| MUI (Material UI) | 완성도 높음 | 무거움, 스타일 제약 | 제외 |
| Chakra UI | DX 좋음 | 번들 크기, 커스텀 제약 | 제외 |
| Ant Design | 기업용 풍부 | 중국어 문서, 무거움 | 제외 |
| Mantine | 현대적 | 생태계 작음 | 제외 |

### 4.5 폼 관리: React Hook Form + Zod

| 항목          | 값                        |
| ------------- | ------------------------- |
| 폼 라이브러리 | react-hook-form 7.52.2    |
| 리졸버        | @hookform/resolvers 3.9.0 |
| 스키마 검증   | zod-form-data 2.0.2       |

**선택 이유**:

1. **비제어 컴포넌트**: 렌더링 최적화
2. **Zod 통합**: 백엔드와 동일한 검증 스키마 공유
3. **타입 추론**: 자동 타입 생성

### 4.6 기타 프론트엔드 라이브러리

| 라이브러리               | 버전    | 용도             |
| ------------------------ | ------- | ---------------- |
| @tanstack/react-table    | 8.20.1  | 데이터 테이블    |
| @fullcalendar/react      | 6.1.15  | 예약 캘린더      |
| date-fns                 | 3.6.0   | 날짜 포맷팅      |
| dayjs                    | 1.11.13 | 날짜 조작 (경량) |
| react-day-picker         | 8.10.1  | 날짜 선택기      |
| vaul                     | 1.1.1   | 모바일 드로어    |
| tailwind-merge           | 2.4.0   | 클래스 병합      |
| class-variance-authority | 0.7.0   | 컴포넌트 변형    |
| clsx                     | 2.x     | 조건부 클래스    |

---

## 5. 백엔드 기술 스택

### 5.1 프레임워크: NestJS

| 항목   | 값      |
| ------ | ------- |
| 선택   | NestJS  |
| 버전   | 11.0.1  |
| 플랫폼 | Express |

**선택 이유**:

1. **모듈 아키텍처**: 관심사 분리, 확장성
2. **의존성 주입**: 테스트 용이성
3. **데코레이터 기반**: 선언적 코드
4. **TypeScript 네이티브**: 타입 안전성

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Express | 단순함, 유연함 | 구조 부재, 보일러플레이트 | 제외 |
| Fastify | 빠른 성능 | NestJS 대비 생태계 작음 | 제외 |
| Koa | 미들웨어 우수 | 구조 부재 | 제외 |
| Hono | 경량, Edge 지원 | 신생, 생태계 작음 | 제외 |

### 5.2 인증: Passport JWT

| 항목 | 값                              |
| ---- | ------------------------------- |
| 선택 | @nestjs/passport + passport-jwt |
| JWT  | @nestjs/jwt                     |

**구현 전략**:

- Access Token: 짧은 만료 (예: 1시간)
- Refresh Token: 긴 만료 (예: 7일)
- Refresh Token은 bcrypt 해시하여 DB 저장

### 5.3 검증: nestjs-zod

| 항목      | 값                   |
| --------- | -------------------- |
| 선택      | nestjs-zod           |
| 에러 변환 | zod-validation-error |

**선택 이유**:

1. **Zod 통합**: 프론트엔드와 스키마 공유
2. **자동 DTO 생성**: createZodDto() 함수
3. **Swagger 통합**: OpenAPI 스펙 자동 생성

---

## 6. 데이터베이스

### 6.1 RDBMS: PostgreSQL

| 항목      | 값         |
| --------- | ---------- |
| 선택      | PostgreSQL |
| 버전      | 14+        |
| 로컬 포트 | 5433       |

**선택 이유**:

1. **관계형 데이터**: 복잡한 관계 모델링 적합
2. **ACID 준수**: 트랜잭션 안정성
3. **JSON 지원**: 필요시 반정형 데이터 저장
4. **확장성**: 대용량 데이터 처리

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| MySQL | 널리 사용 | JSON 기능 약함 | 제외 |
| SQLite | 설정 불필요 | 동시성 제한, 프로덕션 부적합 | 제외 |
| MongoDB | 유연한 스키마 | 관계 모델링 약함 | 제외 |

### 6.2 ORM: Prisma

| 항목      | 값                                 |
| --------- | ---------------------------------- |
| 선택      | Prisma                             |
| 버전      | 6.11.1                             |
| 출력 위치 | packages/database/generated/prisma |

**선택 이유**:

1. **타입 안전성**: 쿼리 결과 자동 타입화
2. **스키마 우선**: schema.prisma가 진실의 원천
3. **마이그레이션**: 선언적 스키마 변경 관리
4. **관계 로딩**: Include/Select 패턴

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| TypeORM | 데코레이터 패턴 | 타입 추론 약함, 복잡함 | 제외 |
| Drizzle | 성능 우수 | 신생, 문서 부족 | 제외 |
| Sequelize | 성숙함 | TypeScript 지원 약함 | 제외 |
| Knex | SQL 직접 작성 | ORM 기능 부족 | 제외 |

---

## 7. 검증 라이브러리

### 7.1 Zod

| 항목 | 값      |
| ---- | ------- |
| 선택 | Zod     |
| 버전 | 3.25.76 |

**선택 이유**:

1. **TypeScript 우선**: 타입 추론 자동
2. **런타임 검증**: 서버/클라이언트 양쪽 검증
3. **스키마 공유**: @repo/shared-types 패키지화
4. **직관적 API**: 체이닝 방식

**대안 검토**:
| 대안 | 장점 | 단점 | 결론 |
|------|------|------|------|
| Yup | 널리 사용 | 타입 추론 약함 | 제외 |
| Joi | Node.js 표준 | TS 지원 약함, 무거움 | 제외 |
| class-validator | 데코레이터 패턴 | 런타임 오버헤드 | 제외 |
| io-ts | 함수형 | 학습 곡선 높음 | 제외 |

---

## 8. 코드 품질 도구

### 8.1 TypeScript

| 항목   | 값    |
| ------ | ----- |
| 버전   | 5.8.2 |
| strict | true  |

**주요 설정**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true
  }
}
```

### 8.2 ESLint

| 항목      | 값                             |
| --------- | ------------------------------ |
| 버전      | 8.57.0                         |
| 설정 방식 | Flat Config (eslint.config.js) |

**주요 플러그인**:

- @eslint/js
- typescript-eslint
- eslint-plugin-turbo
- @next/eslint-plugin-next (apps/web)
- eslint-plugin-react, react-hooks
- @tanstack/eslint-plugin-query

### 8.3 Prettier

| 항목          | 값          |
| ------------- | ----------- |
| 탭 크기       | 2           |
| 세미콜론      | true (기본) |
| 따옴표        | 싱글 쿼트   |
| 트레일링 쉼표 | all         |

### 8.4 Husky + lint-staged

**커밋 전 검사**:

```json
{
  "*.{js,jsx,ts,tsx}": "eslint --fix",
  "*.{js,jsx,ts,tsx,json,css,md}": "prettier --check"
}
```

---

## 9. 테스트 도구

### 9.1 Jest

| 항목 | 값                 |
| ---- | ------------------ |
| 버전 | (NestJS 기본 포함) |
| 환경 | node               |

**용도**: 백엔드 단위/통합 테스트

### 9.2 Supertest

| 항목 | 값         |
| ---- | ---------- |
| 용도 | E2E 테스트 |

**용도**: NestJS API 엔드포인트 테스트

---

## 10. 버전 명세 (전체)

### 10.1 루트 패키지

```json
{
  "packageManager": "pnpm@10.13.1",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "turbo": "^2.5.4",
    "typescript": "^5.8.2",
    "eslint": "^8.57.0",
    "prettier": "^3.5.3"
  }
}
```

### 10.2 apps/web

```json
{
  "dependencies": {
    "next": "14.2.35",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-auth": "^5.0.0-beta.20",
    "@tanstack/react-query": "^5.81.5",
    "@tanstack/react-table": "^8.20.1",
    "react-hook-form": "^7.52.2",
    "@hookform/resolvers": "^3.9.0",
    "zod-form-data": "^2.0.2",
    "tailwindcss": "^3.4.1",
    "date-fns": "^3.6.0",
    "dayjs": "^1.11.13",
    "lucide-react": "^0.424.0",
    "@fullcalendar/react": "^6.1.15"
  },
  "devDependencies": {
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4"
  }
}
```

### 10.3 apps/api

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/config": "^4.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^11.0.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "nestjs-zod": "^4.4.0",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.1",
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

### 10.4 packages/database

```json
{
  "dependencies": {
    "prisma": "^6.11.1",
    "@prisma/client": "^6.11.1"
  }
}
```

### 10.5 packages/shared-types

```json
{
  "dependencies": {
    "zod": "^3.25.76"
  },
  "peerDependencies": {
    "@repo/database": "workspace:*"
  }
}
```

### 10.6 packages/api-client

```json
{
  "peerDependencies": {
    "@repo/shared-types": "workspace:*"
  }
}
```

---

## 11. 호환성 매트릭스

### 11.1 React 버전

| 패키지      | React 버전 | 비고                 |
| ----------- | ---------- | -------------------- |
| apps/web    | 18.3.1     | Next.js 14 권장 버전 |
| packages/ui | 19.1.0     | 최신 (주의 필요)     |

**주의**: packages/ui는 React 19를 사용하나, apps/web은 18.3.1 사용. 호환성 확인 필요.

### 11.2 TypeScript 설정 상속

```
@repo/typescript-config/base.json
├── @repo/typescript-config/nextjs.json (apps/web)
├── @repo/typescript-config/react-library.json (packages/ui)
└── apps/api (base.json 확장)
```

---

## 12. 미래 고려사항

### 12.1 업그레이드 로드맵

| 기술      | 현재     | 목표       | 우선순위 |
| --------- | -------- | ---------- | -------- |
| Next.js   | 14.2     | 15.x       | 중       |
| next-auth | 5.0 beta | 5.0 stable | 높음     |
| React     | 18.3     | 19.x       | 낮음     |
| pnpm      | 10.x     | 최신       | 낮음     |

### 12.2 추가 검토 기술

| 기술     | 용도          | 검토 시점                 |
| -------- | ------------- | ------------------------- |
| tRPC     | 타입 안전 API | API 복잡도 증가 시        |
| GraphQL  | 유연한 쿼리   | 클라이언트 요구 다양화 시 |
| Redis    | 캐싱/세션     | 성능 이슈 발생 시         |
| S3/MinIO | 파일 저장     | 이미지 업로드 구현 시     |

---

## 13. 참조 문서

| 문서 ID | 문서명         | 관계           |
| ------- | -------------- | -------------- |
| DOC-001 | 프로젝트 개요  | 요구사항 기반  |
| DOC-003 | 아키텍처 설계  | 기술 스택 적용 |
| DOC-013 | 개발 환경 설정 | 설치 가이드    |
