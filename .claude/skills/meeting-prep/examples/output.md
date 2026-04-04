# meeting-prep 출력 예시

> 이 파일은 스킬이 생성해야 하는 출력물의 few-shot 예시이다.
> 실제 데이터(2026-03-28 ~ 2026-04-04, 손장수)로 작성됨.

---

## `meeting-prep` 실행 결과

> **기간**: 2026-03-28 (4차 회의) ~ 2026-04-04 (현재)
> **대상**: manamana32321 (손장수)
> **소스**: GitHub Issues/PR, Sentry, Notion 4차 회의록

---

# 진행 상황 공유

## 프론트
### > @손장수
- ✅ YouTube URL 검증 강화 ([#365](https://github.com/skku-amang/main/issues/365) → [PR #366](https://github.com/skku-amang/main/pull/366))
- ✅ YouTube 유틸 SSOT 통합 ([#369](https://github.com/skku-amang/main/issues/369) → [PR #372](https://github.com/skku-amang/main/pull/372))
- ✅ Prisma engine enum entrypoint 분리 ([PR #380](https://github.com/skku-amang/main/pull/380)) — Vercel 배포 시 Query Engine 누락 해결
- 🔧 에러 메시지 개선 + 팀 지원 에러 표시 ([#382](https://github.com/skku-amang/main/issues/382), [#384](https://github.com/skku-amang/main/issues/384) → [PR #383](https://github.com/skku-amang/main/pull/383))
- ⏸️ 로그인 재요구 버그 ([#358](https://github.com/skku-amang/main/issues/358)) ← 4차 분배, 미착수
- ⏸️ 모바일 회원가입 불가 ([#359](https://github.com/skku-amang/main/issues/359)) ← 4차 분배, 미착수

## 인프라
### > @손장수
- ✅ Sentry 도입 ([#361](https://github.com/skku-amang/main/issues/361) → [PR #370](https://github.com/skku-amang/main/pull/370)) ← 4차 분배
- ✅ 임베디드 → 유저 QA ([#360](https://github.com/skku-amang/main/issues/360)) ← 4차 분배
- ✅ DB CronJob → ArgoCD PreSync Hook 전환 ([PR #377](https://github.com/skku-amang/main/pull/377))
- ✅ Job 파드 라벨 충돌 502 해소 ([PR #378](https://github.com/skku-amang/main/pull/378))
- ✅ 헬스체크 Sentry 에러 캡처 제외 ([PR #387](https://github.com/skku-amang/main/pull/387))
- ✅ 온보딩 자동화 셋업 스크립트 ([PR #374](https://github.com/skku-amang/main/pull/374))
- ✅ deps 업데이트 + ESLint 9 마이그레이션 ([PR #376](https://github.com/skku-amang/main/pull/376))
- ✅ Jest → Vitest 마이그레이션 ([#367](https://github.com/skku-amang/main/issues/367))
- 🔧 DB 마이그레이션 Job 생성 ([#362](https://github.com/skku-amang/main/issues/362)) ← 4차 분배, 진행 중
- 🔧 CI 테스트 워크플로우 분리 및 병렬화 ([#368](https://github.com/skku-amang/main/issues/368))
- 🔧 seed 스크립트 멱등성 확보 ([#379](https://github.com/skku-amang/main/issues/379) → [PR #381](https://github.com/skku-amang/main/pull/381))

## 4차 작업 분배 이행

| 분배 작업 | 영역 | 결과 |
|---|---|---|
| 임베디드 → 유저 QA | 인프라 | ✅ 완료 ([#360](https://github.com/skku-amang/main/issues/360)) |
| Sentry 도입 | 인프라 | ✅ 완료 ([#361](https://github.com/skku-amang/main/issues/361) → [PR #370](https://github.com/skku-amang/main/pull/370)) |
| DB 마이그레이션 Job 생성 | 인프라 | 🔧 진행 중 ([#362](https://github.com/skku-amang/main/issues/362)) |
| 로그인 재요구 버그 | 프론트 | ⏸️ 미착수 ([#358](https://github.com/skku-amang/main/issues/358)) |
| 모바일 회원가입 불가 | 프론트 | ⏸️ 미착수 ([#359](https://github.com/skku-amang/main/issues/359)) |

---

# 논의 안건

*진행 상황에 포함되지 않은 새로운 제안/의사결정 필요 항목만*

## 프론트
### > @손장수
- NFC 기반 악기/장비 대여·반납 자동화 ([#373](https://github.com/skku-amang/main/issues/373))
- 긍정 피드백 위젯 + Slack 알림 파이프라인 ([#385](https://github.com/skku-amang/main/issues/385))
- Vercel 배포 시 Prisma Query Engine 누락 ([#375](https://github.com/skku-amang/main/issues/375))
- 에러 타입 매핑 exhaustive switch 전환 ([#388](https://github.com/skku-amang/main/issues/388))

## 인프라
### > @손장수
- 주간 활동 리포트 Slack 자동 발송 ([#386](https://github.com/skku-amang/main/issues/386))

---

# Sentry 에러 현황

| 상태 | 에러 | 프로젝트 | 이벤트 | 처리 |
|---|---|---|---|---|
| ✅ | PrismaClientInitializationError | web | 54건 | [PR #380](https://github.com/skku-amang/main/pull/380) |
| ✅ | 헬스체크 503 | api | 2건 | [PR #387](https://github.com/skku-amang/main/pull/387) |
| ✅ | PrismaKnownRequestError (rentals) | api | 15건 | resolved |
| ⚠️ | 서버 에러 /performances/1/teams ([WEB-9](https://amang-23.sentry.io/issues/WEB-9)) | web | 1건 | **미해결** |

---

## 형식 규칙

1. **상태 아이콘**: ✅ 완료, 🔧 진행 중, ⏸️ 미착수, ⚠️ 미해결
2. **링크 필수**: 모든 이슈/PR/Sentry 이슈에 클릭 가능한 링크 포함
3. **이슈-PR 연결**: `(#이슈 → PR #번호)` 형태로 연결 관계 명시
4. **4차 분배 표시**: 직전 회의에서 분배받은 항목에 `← N차 분배` 부기
5. **중복 제거**: 진행 상황에 있는 항목은 논의 안건에 포함하지 않음
6. **토글 헤딩**: `### > @이름`은 노션에서 `is_toggleable: true` heading_3으로 변환
7. **영역 분류**: `scope:` 라벨 기반, 없으면 제목 키워드로 추정
8. **정렬**: ✅ → 🔧 → ⏸️ 순서로 정렬
