# ADR-0001: 텔레메트리 라우팅 — Tier split (FE Sentry / BE 홈랩)

**작성일**: 2026-05-05 (v2 재작성)
**상태**: Accepted
**작성자**: JSON (+ Claude Code 협업)
**관련 이슈**: [#490](https://github.com/skku-amang/main/issues/490) (원안), [#498](https://github.com/skku-amang/main/pull/498) (v1 Phase 1 PR — 본 ADR로 대체되어 close)

## Context

AMANG은 두 관측 스택을 보유:

- **Sentry SaaS** (`amang-23`): errors / replay / feedback widget / source maps. FE 측 사용자 경험에 강함
- **홈랩 K3s** (`observability` namespace): OTel Collector + Loki + Prometheus + Tempo + Grafana + Promtail + Blackbox. 인프라 메트릭·장기 보존·PromQL/LogQL에 강함

두 스택을 어떻게 사용할지에 대한 단순한 결정이 필요. v1 ADR은 "OTelcol single egress + Sentry 3 예외" 모델을 채택했으나 실제 운영 시 다음 마찰 발생:

- Sentry SDK + `@sentry/opentelemetry` + OTel SDK 3개 라이브러리 상호작용 복잡 (Phase 1 [#498](https://github.com/skku-amang/main/pull/498) 리뷰에서 두 차례 디버깅 비용 발생)
- ADR 신호 라우팅 표가 Decision 3 (FE OTel 보류)와 자기 모순 — FE 행은 OTelcol 경유로 표기됐으나 결정은 우회였음
- 1인 운영자(인프라+프론트+AX 담당)의 mental model 부하 ↑

본 v2는 **KISS 원칙 충실**을 우선해 단순한 tier 분담 모델로 재작성.

## Decision

### 핵심 원칙

> **FE 모든 텔레메트리는 Sentry로, BE 모든 텔레메트리는 홈랩(OTel Collector 경유)으로 보낸다. 양쪽이 섞이지 않는다.**

### 신호별 라우팅

| Tier                | 신호                              | Destination                                        |
| ------------------- | --------------------------------- | -------------------------------------------------- |
| **FE** (`apps/web`) | errors / console.error·warn       | Sentry Issues                                      |
| FE                  | Web Vitals                        | Sentry Performance                                 |
| FE                  | session replay                    | Sentry Replay                                      |
| FE                  | user feedback widget              | Sentry                                             |
| FE                  | source maps                       | Sentry (sentry-cli at build-time)                  |
| **BE** (`apps/api`) | logs (pino)                       | Loki (현행 stdout → Promtail)                      |
| BE                  | traces                            | Tempo (OTLP via OTelcol)                           |
| BE                  | custom metrics (req rate, p95 등) | Prometheus (`/metrics` endpoint scrape)            |
| BE                  | errors                            | Loki + Grafana alert (5xx rate, error log pattern) |
| **공통** (앱 외부)  | Pod / Node 메트릭                 | Prometheus (kube-state-metrics)                    |
| 공통                | 외부 가용성                       | Prometheus (Blackbox Exporter)                     |

### 아키텍처 다이어그램

```
[FE Tier — Sentry]
apps/web ──Sentry SDK──→ Sentry SaaS  (errors / replay / feedback / vitals)
CI       ──sentry-cli──→ Sentry        (source maps, build-time)

[BE Tier — 홈랩]
apps/api ──OTLP──→ OTelcol ──┬──→ Tempo        (traces)
                              ├──→ Loki         (logs, 향후 OTel logs)
                              └──→ Prometheus   (metrics)
apps/api ──pino stdout──→ Promtail ──→ Loki     (현행, 변화 없음)

[공통 — 앱 외부, 항상 홈랩]
kube-state-metrics ──→ Prometheus
Blackbox Exporter  ──→ Prometheus
```

## Consequences

### 얻는 것

- **Mental model 단순화**: 한 줄로 정의됨 ("FE = Sentry, BE = 홈랩"). 1인 운영자가 6개월 뒤에도 기억 가능
- **`apps/api/src/instrument.ts` 정신적 부채 청산**: Sentry SDK + `@sentry/opentelemetry` + OTel SDK 3개 라이브러리 상호작용 제거 → 순수 OTel SDK
- **vendor lock-in 명시화**: FE는 의도적 Sentry 의존, BE는 의도적 OTel/홈랩. 어느 한쪽이 깨져도 다른 쪽 영향 없음
- **각 도구 강점 영역에 집중**: Sentry는 사용자 incident 분석 (replay, feedback, dedup, source maps), 홈랩은 인프라·장기 보존·PromQL/LogQL
- **`@sentry/nestjs`, `@sentry/profiling-node`, `@sentry/opentelemetry` 의존성 제거**: BE 런타임 부하 ↓, 빌드 시간 ↓

### 잃는 것 (의식적 선택)

| 항목                                                                             | 영향   | 완화                                                                                                                                                      |
| -------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BE error dedup (Sentry의 자동 그룹화)                                            | medium | Loki LogQL `count by (error_class)` aggregation + Grafana alert. AMANG 트래픽(일 수백명)에서 manageable                                                   |
| BE production stack trace symbolication                                          | medium | Source map 자동 적용 손실. compiled `dist/main.js:NNN`만 보임. 디버깅 시 git SHA로 source 직접 열어 추적 (별도 도구 도입 X — premature optimization 회피) |
| sentry-triage 스킬 BE 부분 ([#456](https://github.com/skku-amang/main/pull/456)) | medium | 절반 폐기 (FE 전용 재정의). AMANG 버그 피드백은 압도적으로 FE이므로 핵심 가치 보존                                                                        |
| Sentry profiling                                                                 | low    | Pyroscope 미도입 → BE profiling 포기. AMANG에서 활용 사례 없음                                                                                            |
| BE breadcrumbs (자동 인접 이벤트)                                                | low    | pino mixin이 이미 `userId`/`X-Request-Id` 자동 첨부 → Loki query로 동일 효과                                                                              |

## Alternatives Considered

### 대안 1: OTelcol single egress + Sentry 예외 enumerate (v1 ADR)

**거부 이유**:

- Sentry SDK + `@sentry/opentelemetry` 브릿지 패턴 복잡 — Phase 1 리뷰에서 검증된 비용
- "예외 3개" enumerate 부담 + 시간 지나며 예외 늘어날 위험
- 1인 운영자 mental model 부하 ↑
- ADR 신호 라우팅 표가 Decision 3와 자기 모순 발생 (FE 행)

**부활 조건**: 사실상 없음. 본 v2 ADR이 거부하는 모델.

### 대안 2: Sentry 일원화 (홈랩 폐기)

**거부 이유**:

- Pod CPU/메모리 메트릭 부재 → capacity planning 불가
- PromQL/LogQL 표현력 손실
- 홈랩 관측성 스택(이미 운영 중) 자산 폐기

### 대안 3: 홈랩 일원화 (Sentry 폐기)

**거부 이유**:

- Session Replay 대체 불가
- Feedback widget 직접 구현 부담
- Source map 자동 적용 손실 (BE 외 FE도)
- AMANG 버그 피드백 트리아지 자산([#456 sentry-triage](https://github.com/skku-amang/main/pull/456)) 폐기

### 대안 4: Soft tier split (FE Sentry / BE 홈랩 + Sentry errors-only)

**거부 이유**:

- "BE는 거의 홈랩, 가끔 Sentry" — 한 번 더 mental jump 필요. KISS 원칙 위반
- `@sentry/nestjs` 의존 유지 → instrument.ts 복잡도 잔존

## 후속 작업

본 ADR이 Accepted된 후 아래 후속 작업 진행.

- [x] BE Sentry SDK 제거 (`@sentry/nestjs`, `@sentry/profiling-node`, `@sentry/opentelemetry` 등) — 본 PR에 포함
- [x] `apps/api/src/instrument.ts` 순수 OTel SDK로 재작성 — 본 PR에 포함
- [x] `apps/api/src/app.module.ts`에서 `SentryModule` 제거 — 본 PR에 포함
- [x] `apps/api/src/common/filters/all-error.filter.ts`에서 `Sentry.captureException` 제거 — 본 PR에 포함
- [x] production overlay에서 `SENTRY_DSN` env var 제거 — 본 PR에 포함
- [ ] **신규 이슈 — BE Loki 기반 error alert 룰** (5xx rate, 에러 패턴 alert) → Grafana
- [ ] **신규 이슈 — sentry-triage 스킬 FE 전용 재정의** (BE 부분 제거)
- [ ] [#494 OTelcol Sentry exporter](https://github.com/skku-amang/main/issues/494) → close as not-planned. BE가 Sentry로 갈 일 없음
- [ ] [homelab#198](https://github.com/manamana32321/homelab/issues/198) → close as not-planned (#494와 페어)
- [ ] [#499 source maps](https://github.com/skku-amang/main/issues/499) → BE 부분 scope 제거 (`@sentry/cli` 단계 불필요), FE Vercel 자동 업로드만 남김

## 부활 트리거 (재오픈 조건)

본 모델은 다음 조건에서 재평가:

- AMANG 사용자 베이스 5배 이상 확장 (BE error dedup 부재 비용이 현저해질 때)
- BE에서 production stack trace symbolication 부재로 디버깅 마찰이 운영 부담으로 누적될 때 (3건 이상 incident)
- 새로운 관측성 도구가 등장해 두 스택의 봉합 가치가 명백해질 때 (예: OpenTelemetry profiling 표준 GA + 홈랩 도입)

## Cross-references

- 이슈: [skku-amang/main#490](https://github.com/skku-amang/main/issues/490)
- v1 PR (superseded): [#491 ADR initial](https://github.com/skku-amang/main/pull/491)
- v1 Phase 1 PR (closed by this v2 PR): [#498](https://github.com/skku-amang/main/pull/498)
- 보류된 분석 인프라 에픽: [#434](https://github.com/skku-amang/main/issues/434), [#435](https://github.com/skku-amang/main/issues/435), [#436](https://github.com/skku-amang/main/issues/436) (PostHog 보류, 본 ADR과 독립)
- 홈랩 observability 스택: [homelab repo k8s/observability/](https://github.com/manamana32321/homelab/tree/main/k8s/observability)
- sentry-triage 스킬: [#456](https://github.com/skku-amang/main/pull/456)

## 변경 이력

- **2026-05-05 v2**: KISS 원칙 충실 — "OTelcol single egress + 3 예외" 모델 → "Tier split (FE Sentry / BE 홈랩)" 모델로 재작성. v1의 결정 4건은 자연 해소되거나 무관해짐
- **2026-05-05 v1**: 초안 작성 → 결정 4건 채움 → Accepted. 결정 1은 "Tempo 도입 여부"가 아니라 "이미 가동 중인 Tempo의 활용 방식"으로 정정 (인프라 inventory 누락이 초안 작성 중 발견됨)
