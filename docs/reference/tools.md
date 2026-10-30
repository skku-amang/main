# 외부 도구

> **For**: 외부 SaaS / 클러스터 운영 도구 정보를 찾는 사람 또는 AI.
> **You'll be able to**: 도구별 Web/CLI/MCP 접근 방법, 선언 위치, 계정/식별자 확인

코드/Terraform에 없는 외부 정보의 단일 진실. **선언적으로 관리되는 항목은 정의 위치 링크로 연결** (중복 작성 X)

축 분리: **Web** (인간 only), **CLI** (인간 + AI), **MCP** (AI only). `-` = 해당 접근법 없음/미사용. MCP 서버 정의는 [.mcp.json](../../.mcp.json), 우선순위 규칙은 루트 [AGENTS.md](../../AGENTS.md).

## Terraform 선언적 관리

| 도구       | 용도                      | Terraform 모듈                                           | Web                                                                                            | CLI | MCP            |
| ---------- | ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --- | -------------- |
| **Sentry** | 에러 트래킹 + 유저 피드백 | [infra/terraform/sentry/](../../infra/terraform/sentry/) | <ul><li>[amang-23 org](https://amang-23.sentry.io/)<ul><li>web</li><li>api</li></ul></li></ul> | -   | `amang-sentry` |

## 클러스터 (homelab 레포 · ArgoCD 선언)

homelab K3s에서 돌아가는 도구. 정의는 [manamana32321/homelab](https://github.com/manamana32321/homelab) 레포, 아망 쪽 파이프라인 정의는 [infra/](../../infra/).

| 도구            | 용도                                                                                                               | 정의 위치                                                                                                             | Web                                                                                                                                | CLI                                                                               | MCP                |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| **Kargo**       | staging → production 승격 (API·web)                                                                                | 설치: homelab `k8s/kargo` / 파이프라인: [infra/kargo/](../../infra/kargo/)                                            | [kargo.json-server.win](https://kargo.json-server.win) (Authentik, `authentik Admins`)                                             | `kargo` (`kargo login https://kargo.json-server.win --sso`)                       | -                  |
| **ArgoCD**      | 쿠버네티스 배포 sync                                                                                               | homelab `k8s/argocd/applications/apps/amang/`                                                                         | [argocd.json-server.win](https://argocd.json-server.win)                                                                           | `argocd`                                                                          | -                  |
| **Kubernetes**  | API·DB·Redis·MinIO 워크로드                                                                                        | [infra/k8s/](../../infra/k8s/)                                                                                        | [Headlamp](https://k8s.json-server.win)                                                                                            | `kubectl` (`--context json`)                                                      | `amang-kubernetes` |
| **Grafana**     | 메트릭·로그·트레이스                                                                                               | homelab `k8s/observability/`                                                                                          | [grafana.json-server.win](https://grafana.json-server.win)                                                                         | -                                                                                 | `amang-grafana`    |
| **PostgreSQL**  | API DB (staging / production)                                                                                      | [infra/k8s/db/](../../infra/k8s/db/)                                                                                  | [CloudBeaver](https://db.json-server.win) (Authentik, skku-amang GitHub org 멤버)                                                  | `kubectl exec` (DB pod에 직접. `app=api` 라벨 pod를 띄우면 API 서비스에 끼어 502) | -                  |
| **Umami**       | web 방문 통계                                                                                                      | [infra/k8s/umami/](../../infra/k8s/umami/)                                                                            | [analytics.amang.json-server.win](https://analytics.amang.json-server.win)                                                         | -                                                                                 | -                  |
| **MinIO**       | 파일 저장소                                                                                                        | homelab `k8s/minio-tenants/`                                                                                          | <ul><li>[production](https://minio.amang.json-server.win)</li><li>[staging](https://minio.amang.staging.json-server.win)</li></ul> | -                                                                                 | -                  |
| **traffic-bot** | 스테이징 가짜 트래픽 CronJob (봇 계정·부원 풀이 프로덕션 빈도로 팀·예약·가입을 쌓고, 지정 부원에게 알림이 가게 함) | [infra/k8s/api/overlays/staging/traffic/](../../infra/k8s/api/overlays/staging/traffic/) (동작은 `traffic.js` 머리말) | -                                                                                                                                  | `kubectl --context json -n amang-api-staging get jobs`                            | -                  |

## 외부 SaaS (Terraform 외)

| 도구       | 용도                     | Web                                                               | CLI                            | MCP            | 비고                                                                                                                                                                                                                                    |
| ---------- | ------------------------ | ----------------------------------------------------------------- | ------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub** | 코드 / 이슈 / PR / CI/CD | [skku-amang/main](https://github.com/skku-amang/main)             | `gh` (이슈/PR/CI/체크 등 모두) | -              | <ul><li>API 이미지: [GHCR amang-api](https://github.com/orgs/skku-amang/packages)</li><li>GitHub App `amang-kargo`: Kargo의 `env/*` push 전용, ruleset `env branches (Kargo only)`로 사람 push 차단 (레포 설정에서 수동 생성)</li></ul> |
| **Figma**  | 디자인 + 핸드오프        | [AMANG-New-](https://www.figma.com/design/hmVkj0Fq8c3dbeslIG31X9) | -                              | `amang-figma`  | 공식 리모트 MCP, OAuth                                                                                                                                                                                                                  |
| **Notion** | 기획 / 아이디어          | 아망 워크스페이스                                                 | -                              | `amang-notion` | -                                                                                                                                                                                                                                       |
| **Slack**  | 일상 커뮤니케이션        | Amang-Homepage 워크스페이스                                       | -                              | `amang-slack`  | -                                                                                                                                                                                                                                       |

## 도구 도입 / 변경 절차

1. Terraform·클러스터 매니페스트로 관리 가능한 항목 → 먼저 선언적으로 추가, 본 문서에는 정의 위치 링크만
2. 선언 밖 정보 (수동 생성한 계정·앱·ruleset 등) → 본 문서 비고에 기록
