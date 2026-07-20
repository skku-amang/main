# 도메인 모델

엔티티의 정확한 필드는 [packages/database/prisma/schema.prisma](../../packages/database/prisma/schema.prisma)를, 도메인 용어 정의는 [glossary.md](glossary.md)를 참조하세요.

## 엔티티 관계

```
Performance (공연)
└── Team (밴드 팀)
    ├── Song (곡 정보)
    └── TeamSession (세션 슬롯)
        ├── Session (악기: VOCAL, GUITAR, BASS, SYNTH, DRUM 등)
        └── TeamMember (참여자)

User (사용자)
├── Generation (기수)
└── Sessions (연주 가능한 세션들)

Equipment (장비/동아리방 예약)
```

## 데이터 흐름

```
Web (TanStack Query) → ApiClient (@repo/api-client) → API (NestJS) → Prisma → PostgreSQL
```

- **인증**: next-auth v5 → JWT access/refresh 토큰 → ApiClient가 토큰 자동 갱신
- **타입 안전성**: `@repo/shared-types`의 Zod 스키마를 프론트/백엔드에서 공유
