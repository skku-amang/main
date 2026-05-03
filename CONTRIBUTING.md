# Contributing

## 팀

| GitHub ID                                          | 역할                    |
| -------------------------------------------------- | ----------------------- |
| [@manamana32321](https://github.com/manamana32321) | 프로젝트 총괄 (전 분야) |
| [@nhjbest22](https://github.com/nhjbest22)         | 백엔드                  |
| [@ssukim12](https://github.com/ssukim12)           | 디자인, 프론트엔드      |
| 윤규성                                             | 기획                    |

## 라벨

이슈/PR 라벨은 **제목으로 표현할 수 없는 메타데이터**만 담습니다. `type:` / `scope:`는 Conventional Commits 제목(`fix(web): ...`)으로 표현되므로 라벨로 중복 관리하지 않습니다.

아래 "라벨 매니페스트" 섹션이 **단일 정의(SSOT)** 입니다. GitHub 레포의 라벨은 이 표에 맞춰 관리합니다 (추가/변경 시 GitHub UI 또는 `gh label` 명령으로 직접 적용).

### 축별 라벨

| 축            | 값                                       | 대상          | 필수               |
| ------------- | ---------------------------------------- | ------------- | ------------------ |
| `kind:`       | `bug`, `enhancement`, `question`, `task` | 이슈          | ✅                 |
| `priority:`   | `critical`, `high`, `low`                | 이슈 + PR     | 맥락에 따라        |
| `from:`       | `sentry`, `user-feedback`                | 이슈          | 자동 유입일 때     |
| `resolution:` | `duplicate`, `wontfix`, `invalid`        | 이슈 Close 시 | Close 사유 필요 시 |

### 사용 규칙

**이슈**:

- `kind:*` 1개 **필수** (템플릿에서 자동 설정)
- 긴급도 판단 후 `priority:*` 추가
- Sentry나 유저 피드백에서 유입됐으면 `from:*`
- 처리 상태는 라벨이 아닌 **이슈 자체의 open/closed** + 코멘트로 표현 (재현 확인, 외부 의존성 대기 등)

**PR**:

- 기본적으로 라벨 없이 제출 (제목이 SSOT)
- 머지 순서 중요하면 `priority:*`

### 라벨 매니페스트

| 이름                  | 색상   | 설명                                       |
| --------------------- | ------ | ------------------------------------------ |
| kind: bug             | 3B82F6 | 버그 — 작동하지 않거나 기대와 다르게 동작  |
| kind: enhancement     | 60A5FA | 기능 추가 또는 기존 기능 개선              |
| kind: question        | 93C5FD | 질문 — 사용법 / 안내 요청                  |
| kind: task            | BFDBFE | 일반 작업 (리팩토링, 문서, 의존성 등)      |
| priority: critical    | B91C1C | 즉시 수정 필요 (프로덕션 장애 / 다수 영향) |
| priority: high        | DC2626 | 이번 스프린트 내 처리                      |
| priority: low         | FCA5A5 | 여유 있을 때 처리                          |
| from: sentry          | 10B981 | Sentry 자동 유입                           |
| from: user-feedback   | 34D399 | 유저 피드백                                |
| resolution: duplicate | 9CA3AF | 중복                                       |
| resolution: wontfix   | 6B7280 | 수정하지 않음                              |
| resolution: invalid   | D1D5DB | 유효하지 않음                              |

### 라벨 변경이 필요할 때

1. 위 매니페스트 표를 수정
2. GitHub Settings → Labels 또는 `gh label create/edit` 명령으로 레포에 반영
3. 변경사항을 PR로 커밋

## 이슈 컨벤션

### 이슈 제목 — 자연어로

이슈 제목은 **자연어**로 작성합니다. Conventional Commits(`fix(...)`, `feat(...)`) 포맷을 쓰지 않습니다 — CC는 _변경 행위_(커밋/PR)를 분류하는 도구이고, 이슈는 _문제/요청_을 기술하는 대상이라 본질이 다릅니다.

| 이슈 유형           | 예시                                                            |
| ------------------- | --------------------------------------------------------------- |
| 버그 리포트         | `필터 변경 시 페이지네이션이 초기화되지 않음`                   |
| 기능 요청           | `예약 목록 엑셀(.xlsx) 내보내기`                                |
| 질문                | `장비 예약 가능 기간은?`                                        |
| Sentry 자동 유입    | `로그인 시 TypeError: Cannot read 'user' of undefined` (에러 그대로) |
| User Feedback       | `예약 목록을 엑셀로 내보낼 수 있었으면 좋겠어요` (유저 원문)   |

분류 정보(`bug`/`enhancement`)는 `kind:` 라벨이 담당하므로 제목에 중복할 필요 없습니다.

**이슈 ↔ PR 관계**: 이슈 제목과 PR 제목은 **형식이 다릅니다**. PR 생성 시 CC 포맷으로 변환하세요.

- 이슈: `필터 변경 시 페이지네이션이 초기화되지 않음`
- PR: `fix(web): 필터 변경 시 페이지네이션 초기화`

기존 CC 스타일 이슈 제목은 **그대로 둡니다**. 앞으로 생성되는 이슈부터 이 규칙을 적용합니다.

### 이슈 템플릿

GitHub Issues 탭에서 이슈 템플릿을 선택하여 작성합니다. 라벨은 템플릿에서 자동으로 설정됩니다.

| 템플릿                                                       | 용도         |
| ------------------------------------------------------------ | ------------ |
| [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)           | 버그 제보    |
| [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) | 새 기능 제안 |

- **Assignee**: 직접 작업할 경우 본인을 assignee로 지정합니다.
- **Assignee (배정)**: 담당 분야에 맞는 팀원을 assignee로 지정합니다 (팀 섹션 참고).

## 브랜치 컨벤션

커밋 타입과 동일한 prefix를 사용하며, 설명은 **영어 케밥 케이스(kebab-case)** 로 작성합니다.

```txt
<타입>/<설명>
```

```txt
feat/equipment-reservation
fix/team-cascade-delete
refactor/auth-middleware
chore/upgrade-dependencies
```

## PR 컨벤션

- PR 제목은 커밋과 동일한 Conventional Commits 형식을 따릅니다.
- PR 본문은 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) 템플릿을 따릅니다.
- **Label**: 기본적으로 라벨 없이 제출합니다 (제목이 SSOT). 머지 순서가 중요하거나(예: `priority: critical`) 블로킹 상태(예: `status: blocked`)인 경우에만 추가합니다.
- **Assignee**: PR 작성자를 assignee로 지정합니다.
- **Reviewer**: 변경 분야에 맞는 팀원을 reviewer로 지정합니다 (팀 섹션 참고).

## 커밋 컨벤션

[Conventional Commits v1.0.0](https://www.conventionalcommits.org/ko/v1.0.0/)을 따릅니다.
커밋 메시지는 **한글**로 작성합니다.

### 커밋 형식

```txt
<타입>[적용 범위]: <설명>

[본문]

[꼬리말]
```

### 타입

| 타입       | 설명                                             |
| ---------- | ------------------------------------------------ |
| `feat`     | 새로운 기능                                      |
| `fix`      | 버그 수정                                        |
| `docs`     | 문서 변경                                        |
| `style`    | 코드 의미에 영향 없는 변경 (포맷팅, 세미콜론 등) |
| `refactor` | 버그 수정도 기능 추가도 아닌 코드 변경           |
| `perf`     | 성능 개선                                        |
| `test`     | 테스트 추가/수정                                 |
| `build`    | 빌드 시스템 또는 외부 의존성 변경                |
| `ci`       | CI 설정 변경                                     |
| `chore`    | 기타 (소스/테스트 파일 미수정)                   |

### 적용 범위 (scope)

| 범위         | 대상                         |
| ------------ | ---------------------------- |
| `web`        | `apps/web`                   |
| `api`        | `apps/api`                   |
| `db`         | `packages/database`          |
| `types`      | `packages/shared-types`      |
| `api-client` | `packages/api-client`        |
| `ui`         | `packages/ui`                |
| `infra`      | Docker, CI/CD, K8s 등 인프라 |

여러 범위에 걸치면 쉼표로 구분하거나 (`feat(web,api): ...`) 생략합니다.

### 커밋 예시

```txt
feat(web): 공연 목록 페이지 무한 스크롤 추가
fix(api): 팀 삭제 시 세션 cascade 누락 수정
docs: README에 Storybook 실행 방법 추가
refactor(db): 마이그레이션 파일 정리
feat(web,api): 장비 예약 기능 구현
```

### Breaking Change

하위 호환성을 깨는 변경은 `!`를 붙이거나 꼬리말에 `BREAKING CHANGE:`를 명시합니다.

```txt
feat(api)!: 인증 방식을 세션에서 JWT로 변경

BREAKING CHANGE: 기존 세션 기반 인증 API가 제거됩니다.
```
