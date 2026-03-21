# Contributing

## 이슈 컨벤션

GitHub Issues 탭에서 이슈 템플릿을 선택하여 작성합니다. 라벨은 템플릿에서 자동으로 설정됩니다.

| 템플릿                                                       | 제목 prefix | 용도         |
| ------------------------------------------------------------ | ----------- | ------------ |
| [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)           | `[BUG]`     | 버그 제보    |
| [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) | `[FEAT]`    | 새 기능 제안 |

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
