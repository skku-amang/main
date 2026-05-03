# meeting-prep 출력 예시 (보고서 모드)

> 이 파일은 스킬이 생성해야 하는 출력물의 few-shot 예시이다.
> **노션에 쓰지 않고 Claude 텍스트로만 출력한다.** 사용자가 회의 시작 전 본인의 진행을 누락 없이 보고하기 위한 개인 준비 자료.
> 실제 데이터(2026-04-11 ~ 2026-04-27, 손장수)로 작성됨.

---

## 📋 meeting-prep 보고서 — 26-1 7차 회의 준비

> **기간**: 2026-04-11 (6차 회의) ~ 2026-04-27 (오늘)
> **대상**: manamana32321 (손장수)
> **본인 영역**: 인프라 / 프론트 / AX

---

### 인프라

| # | 내용 | 진행 | 중요도 | 링크 | 상세 |
| --- | --- | --- | --- | --- | --- |
| 1 | grafana_ro 역할 + AMANG DB datasource 노출 | ✅ | 🟡 | [#454](https://github.com/skku-amang/main/issues/454) → [PR #461](https://github.com/skku-amang/main/pull/461), [#463](https://github.com/skku-amang/main/pull/463), [#464](https://github.com/skku-amang/main/pull/464), [#465](https://github.com/skku-amang/main/pull/465) | NetworkPolicy/Init Job 이슈 잡으며 4 PR로 진행 |
| 2 | Grafana MCP(mcp-grafana) 추가 | ✅ | ⚪ | [PR #459](https://github.com/skku-amang/main/pull/459) | 외부 homelab#103 연계 |

### 프론트

| # | 내용 | 진행 | 중요도 | 링크 | 상세 |
| --- | --- | --- | --- | --- | --- |
| 1 | 어드민 유저 테이블 기수·프로필 인라인 편집 | ✅ | ⚪ | [#455](https://github.com/skku-amang/main/issues/455) → [PR #457](https://github.com/skku-amang/main/pull/457) |  |
| 2 | 동방 예약 모달 참여자 칩 오버플로우 수정 | ✅ | 🟡 | [#440](https://github.com/skku-amang/main/issues/440) → [PR #466](https://github.com/skku-amang/main/pull/466) |  |
| 3 | Sentry FAB 동적 위치 (기본 우상단) | ⏸️ | 🔴 | — | ← 6차 분배, 미착수 |

### AX (AI Experience)

| # | 내용 | 진행 | 중요도 | 링크 | 상세 |
| --- | --- | --- | --- | --- | --- |
| 1 | meeting-prep 스킬 출력 테이블 형식 전환 | ✅ | ⚪ | [PR #453](https://github.com/skku-amang/main/pull/453) | 이번 회의 준비에 사용 중 |
| 2 | Sentry 트리아지 자동화 스킬 + 라벨 체계 재편 | 🔧 | 🟡 | [PR #456](https://github.com/skku-amang/main/pull/456) | OPEN, 머지 일정 확정 필요 |

---

### Sentry 에러 현황

| 상태 | 에러 | 프로젝트 | 이벤트 | 링크 | 처리 |
| --- | --- | --- | --- | --- | --- |
| ⚠️ | TypeError: Load failed (`/performances/1/teams`) | web | 2건 (users 2) | [WEB-T](https://amang-23.sentry.io/issues/WEB-T) | 관찰 — 사파리/모바일 네트워크 단절 가능성 |

---

### ⚠️ CC 형식 위반 PR

PR 제목이 Conventional Commits 형식(`<type>(<scope>): <설명>`)을 안 따라 영역 자동 분류가 변경 파일 경로 추정에 의존한 케이스. 다음 PR부터 제목 정정 권장:

- (예시 — 본 시나리오엔 해당 없음): `메시지: 회의록 자동화` → `chore: 회의록 자동화` 또는 `chore(infra): ...`

---

### 💡 회의에서 짚을 포인트

1. **6차 분배 미이행 1건**: Sentry FAB 동적 위치. 인프라 작업(grafana_ro 6 PR)에 시간 쏠리며 프론트 분배가 밀림 → 7차에서 재분배 vs drop 결정 필요
2. **AX 도구 PR 다수 (#453, #456)**: CC scope 미지정 + `.claude/skills/**` 변경 → 변경 파일 경로 추정으로 AX 분류. 향후 비슷한 도구 PR은 `chore(infra): ...` 또는 별도 정책 검토
3. **Sentry WEB-T**: 영향 작지만 lastSeen 갱신 → 재현 OS/브라우저 확인 후 등급 재조정 필요

---

## 형식 규칙

1. **출력 매체**: Claude 텍스트 출력 only — 노션 작성 절대 금지
2. **영역 순서**: 본인 우선 영역 순으로 (인프라/프론트/AX). 영역에 항목 없으면 그 영역 표 자체 생략
3. **컬럼 구성**: `#` | `내용` | `진행` | `중요도` | `링크` | `상세` (Sentry는 별도)
4. **Sentry 컬럼**: `상태` | `에러` | `프로젝트` | `이벤트` | `링크` | `처리`
5. **중요도**:
   - 🔴 높음: Sentry 에러 연관, 직전 분배 미이행, 보안 이슈
   - 🟡 보통: 일반 버그픽스, 진행 중, 배포 관련
   - ⚪ 낮음: chore, 리팩토링, 제안 단계
6. **진행 아이콘**: ✅ 완료 / 🔧 진행 중 / ⏸️ 미착수 / ⚠️ 미해결
7. **정렬**: ✅ → 🔧 → ⏸️ 순서, 미이행 항목은 표 끝
8. **링크 필수**: 모든 이슈/PR/Sentry 이슈에 클릭 가능한 마크다운 링크
9. **이슈-PR 연결**: `#이슈 → PR #번호` 형태, 다중 PR은 콤마로 나열
10. **직전 분배 표시**: 상세 컬럼에 `← N차 분배` 부기
11. **CC 형식 위반 PR 섹션**: PR 제목이 Conventional Commits 형식(`<type>(<scope>): <설명>`)을 안 따르는 PR을 별도 목록으로 — 제목 정정 액션 유도. (라벨 정책 재편으로 `scope:` 라벨 폐지, 영역은 PR 제목·파일 경로로 판정)
12. **Insight 섹션**: 회의에서 짚을 만한 패턴 1-3개 (미이행, 영역 편중, 라벨 누락 등)
