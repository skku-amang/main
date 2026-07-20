# ADR-0001: 텔레메트리 라우팅 — Signal split (incident analysis = Sentry / infra = 홈랩)

**작성일**: 2026-05-05 (v3 재작성)
**상태**: Accepted
**작성자**: JSON (+ Claude Code 협업)
**관련 이슈**: [#490](https://github.com/skku-amang/main/issues/490) (원안)
**Supersedes**: [PR #491 ADR initial](https://github.com/skku-amang/main/pull/491) (v1), [PR #502 ADR v2](https://github.com/skku-amang/main/pull/502) (closed, not merged)

## Context

AMANG은 두 관측 스택을 보유:

- **Sentry SaaS** (`amang-23`): errors, traces (incl. Prisma SQL via pg instrumentation), replay, feedback widget, source maps, Application Metrics (Beta). **사용자 incident 분석에 강함**
- **홈랩 K3s** (`observability` namespace): OTel Collector + Loki + Prometheus + Tempo + Grafana + Promtail + Blackbox + Pyroscope. **인프라 관측·장기 보존·PromQL/LogQL에 강함**

본 ADR은 v1/v2를 거쳐 v3에 이른 결과. journey는 Alternatives Considered 섹션에 거부 사유와 함께 enumerate.

### 주요 사실 (결정 근거)

1. **`@sentry/nestjs` v10은 내부적으로 OpenTelemetry를 wrap** — `@opentelemetry/instrumentation-http`, `instrumentation-nestjs-core`, `instrumentation-pg` (Prisma SQL 자동 캡처), `instrumentation-redis` 등 20+ 인스트루멘테이션 자동. 사용자가 OTel SDK를 별도 설치할 필요 없음. **"Sentry vs OTel" 이분법은 outdated** — Sentry SDK v8+는 OTel + 상용 transport·UI layer
2. **BE Sentry traces가 production에서 이미 작동 중** ([Trace Explorer](https://amang-23.sentry.io/explore/traces/?project=4511134425677824)에서 검증). 한 HTTP 요청당 12+ span 자동 캡처 (middleware, controller, Prisma SQL 포함)
3. **AMANG app 레벨에서 emit하는 metrics는 현재 0개**. 모든 metrics는 인프라 레벨 (node-exporter, kube-state-metrics, Blackbox)에서 Prometheus가 scrape
4. **Sentry Application Metrics는 2025년 Beta로 부활** — 2024년 deprecation 이후 재출시. counter/distribution/gauge API 사용 가능 (`@sentry/nestjs` ≥10.25.0). 향후 NSM 측정 도구로 활용 가능

## Decision

### 핵심 원칙

> **사용자 incident 분석(errors, traces, replay, feedback, application metrics)은 Sentry로, 인프라 관측(K8s/Node 메트릭, 외부 가용성, 로그 집계·장기 보존, 분산 trace 장기 보존)은 홈랩(Grafana 스택)으로 보낸다. 도구 강점 영역에 따라 신호별로 분리.**

이전 v2의 "tier split" (FE/BE app 기준) 과 다름 — **신호 종류에 따라 분리**. 같은 BE라도 errors는 Sentry, infra metrics는 Prometheus.

### 신호별 라우팅

| 신호                              | Origin                             | Destination                                                         | 이유                                                                                                                                                                                                     |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App errors** (FE + BE)          | `@sentry/nextjs`, `@sentry/nestjs` | Sentry Issues                                                       | dedup, source maps, breadcrumbs, sentry-triage 스킬 자동화                                                                                                                                               |
| **App traces** (FE + BE)          | Sentry SDK (내부 OTel)             | Sentry Performance                                                  | N+1 자동 감지, slow endpoint, replay/error correlation                                                                                                                                                   |
| **Session replay** (FE)           | `@sentry/nextjs`                   | Sentry Replay                                                       | 대체 도구 없음                                                                                                                                                                                           |
| **User feedback widget** (FE)     | `@sentry/nextjs`                   | Sentry                                                              | UI 통합                                                                                                                                                                                                  |
| **Source maps** (FE + BE)         | sentry-cli (build-time)            | Sentry                                                              | production stack trace symbolication                                                                                                                                                                     |
| **Application Metrics** (도입 시) | `Sentry.metrics.*` API             | Sentry App Metrics (Beta)                                           | NSM 측정, 향후                                                                                                                                                                                           |
| **App logs** (BE pino)            | stdout (pino)                      | Loki (via Promtail) **+** Sentry Logs (via `pinoIntegration`, Beta) | dual write. Loki = operational store (30d retention, LogQL aggregation, kubectl logs 지원). Sentry Logs = incident-context store (Issue UI에 inline log timeline). Beta 위험은 Loki fallback이 있어 작음 |
| **Pod / Node 메트릭**             | kube-state-metrics, node-exporter  | Prometheus → Grafana                                                | Sentry 범위 밖 (인프라 영역)                                                                                                                                                                             |
| **외부 가용성**                   | Blackbox Exporter                  | Prometheus → Grafana                                                | 외부 prober (Sentry로 갈 일 없음)                                                                                                                                                                        |
| **분산 trace 장기 보존** (선택)   | 사용 시 OTel SDK + Tempo           | Tempo (Grafana)                                                     | Sentry 90일 한계 넘는 retention 필요 시. **현재는 미사용**                                                                                                                                               |

### 아키텍처 다이어그램

```
[Application signals → Sentry]
apps/web ──@sentry/nextjs──→ Sentry SaaS  (errors / traces / replay / feedback / vitals)
apps/api ──@sentry/nestjs──→ Sentry SaaS  (errors / traces incl. Prisma SQL / metrics(beta))
CI       ──sentry-cli────→ Sentry        (source maps, build-time)

[Infra signals → 홈랩 Grafana]
kube-state-metrics ──→ Prometheus  (Pod 상태, replica, restart)
node-exporter      ──→ Prometheus  (CPU, memory, disk, network)
Blackbox Exporter  ──→ Prometheus  (외부 가용성 probe)

[App logs (BE only) → dual write]
apps/api ──pino stdout──→ Promtail ──→ Loki         (operational store)
apps/api ──pinoIntegration (in-process)──→ Sentry   (incident-context store, Beta)

[모두 Grafana UI에서 cross-cut 조회 가능]
```

## Consequences

### 얻는 것

- **Mental model 단순화** (2줄):
  - "사용자가 본 / 사용자에게 영향 미친 신호" → Sentry
  - "시스템 자체의 상태" → Grafana
- **각 도구 강점 영역에 집중**: Sentry는 incident analysis UI (replay+stack+breadcrumbs 한 화면), Grafana는 PromQL/LogQL aggregation + 장기 보존
- **`instrument.ts` 단일 라이브러리** (`@sentry/nestjs`): OTel SDK 직접 import 0. v1 PR #498에서 충돌한 "두 OTel 인스턴스 경쟁" 패턴 회피
- **sentry-triage 스킬 ([#456](https://github.com/skku-amang/main/pull/456))이 FE+BE 모두에 적용**: BE error도 자동 트리아지
- **N+1 / slow endpoint 자동 감지**: Sentry Performance가 trace 패턴 분석. NestJS+Prisma 환경에서 직접적 가치
- **production stack trace symbolication 유지** ([#499](https://github.com/skku-amang/main/issues/499))
- **NSM 측정 path 열림**: PostHog 보류 결정 (`project_analytics_epic.md`) 우회 가능 — `Sentry.metrics.increment("team.formed")` 같은 1줄 추가로 측정 시작

### 잃는 것 (의식적)

| 항목                                 | 영향                                                                          | 완화                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **vendor lock-in 고착화**            | Sentry SaaS 의존도 ↑. FE+BE 양쪽에서 핵심 신호가 Sentry 통과                  | 무료 티어 quota 충분 (5k errors + 5M spans / 월). 진짜 lock-in 비용은 미래 마이그레이션 — 그때는 Sentry SDK가 wrap한 OTel을 외부로 뺄 수 있음 (이미 OTel 기반) |
| **로그-trace correlation 불완전**    | BE pino logs는 Loki, traces는 Sentry → trace_id로 jump하려면 양쪽 라벨링 필요 | 후속 작업: pino mixin에 `Sentry.getActiveSpan()?.spanContext().traceId` 자동 첨부                                                                              |
| **trace 장기 보존 부재**             | Sentry 90일. Tempo 미사용 (30d retention)                                     | AMANG 트래픽에서 90일이면 충분. 필요시 Tempo 활성화 가능 (홈랩에 이미 가동 중)                                                                                 |
| **Grafana Sentry datasource 미도입** | 단일 pane of glass 부재 — Sentry는 Sentry, Grafana는 Grafana                  | 도입 가능 (별도 결정). 현재는 분리 UI 수용                                                                                                                     |

## Alternatives Considered

### v1 — OTelcol single egress + Sentry 3 예외 enumerate ([PR #491](https://github.com/skku-amang/main/pull/491))

> 핵심 원칙: 모든 텔레메트리는 OTLP로 OTel Collector에 보낸다. OTel 스펙으로 표현 불가능한 3가지 (Session Replay / Feedback widget / Source maps) 만 Sentry SDK·CLI로 직송.

**거부 이유**:

- "BE traces를 Sentry+Tempo 양쪽으로 fan-out" 설계가 `@sentry/opentelemetry` 브릿지 패키지 필요화 → 두 OTel 인스턴스(Sentry 내부 + 사용자 manual)가 같은 신호 경쟁 → [PR #498](https://github.com/skku-amang/main/pull/498) 리뷰에서 두 차례 디버깅 비용 발생 (SentrySampler `tracesSampleRate` 회귀 + `/health` filter 누락)
- "예외 3개" enumerate 부담 + 시간 지나며 예외 늘어날 위험 (실제로 FE OTel 보류 Decision 3가 표와 자기 모순)
- 1인 운영자 mental model 부하 ↑

**부활 조건**: 사실상 없음. Sentry SDK가 내부적으로 OTel을 wrap하고 있어 "Sentry vs OTel" 이분법 자체가 outdated.

### v2 — Tier split (FE Sentry / BE 홈랩) ([PR #502](https://github.com/skku-amang/main/pull/502), closed)

> 핵심 원칙: FE 모든 텔레메트리는 Sentry로, BE 모든 텔레메트리는 홈랩(OTel Collector 경유)으로 보낸다.

**거부 이유**:

- **v1 PR #498의 디버깅 비용 트라우마 → over-correction**: 진짜 비용 원인은 "한 신호를 두 SDK가 동시 캡처" (fan-out 설계)였지 "Sentry+OTel 공존" 자체가 아님. Sentry SDK v8+가 이미 OTel을 wrap한다는 사실을 명확히 인식 못 함
- **sentry-triage 스킬 ([#456](https://github.com/skku-amang/main/pull/456)) BE 부분 절반 폐기**: 이미 투자한 자동화 자산 손실
- **N+1 / slow endpoint 자동 감지 손실**: Sentry Performance의 강점이 BE에 적용 안 됨. NestJS+Prisma 환경에서 직접적 비용
- **production stack trace symbolication 손실**: source map 자동 적용이 안 됨 → `dist/main.js:NNN`만 보임
- **mental model 단순화 vs 도구 강점 활용의 균형이 KISS만 보고 강점 무시**: "1줄 mental model"이 매력적이지만 실제 사용 강점을 잃는 게 더 큰 비용

**부활 조건**: AMANG이 Sentry SaaS를 의도적으로 끊어야 할 외부 사유 발생 시 (예: 데이터 주권 강력 요구, Sentry 가격 정책 급변).

### v3 (현재) — Signal split (incident = Sentry / infra = 홈랩)

상기 Decision 섹션 참조.

## 후속 작업

본 ADR v3가 Accepted된 후:

- [x] PR #502 (v2) close as superseded — 완료
- [ ] **신규 이슈 — Sentry Application Metrics 도입** (`team.formed`, `signup.completed` counter 2개). `project_analytics_epic.md` 분석 인프라 에픽 부분 재오픈
- [ ] **신규 이슈 — Trace-log correlation 봉합**: pino mixin에 `Sentry.getActiveSpan()?.spanContext().traceId` 자동 첨부 → Loki query시 trace_id 라벨로 Sentry jump 가능
- [ ] **신규 이슈 — sentry-triage 스킬 BE 적용 확장**: 현재 FE 위주 자동화를 BE 에러까지
- [x] [#494 OTelcol Sentry exporter](https://github.com/skku-amang/main/issues/494) → close as not-planned (v2 잔재, 이미 close됨)
- [x] [homelab#198](https://github.com/manamana32321/homelab/issues/198) → close as not-planned (이미 close됨)
- [ ] [#499 source maps](https://github.com/skku-amang/main/issues/499) → scope 명확화 (FE Vercel 자동 + BE sentry-cli 둘 다 살아있음)

## 부활 트리거 (재오픈 조건)

본 v3 모델은 다음 조건에서 재평가:

- **Sentry 무료 quota 초과 가시화** — 5M spans/월 80% 도달 (현재 트래픽 규모에서 안전 영역 충분)
- **Trace 장기 보존 (90일 초과) 필요성 발생** — 분기·연 단위 incident retro 시 Tempo 활성화 검토
- **Sentry SaaS 외부 사유로 의존 부담** (가격, 정책, 데이터 주권) — 이때 OTel collector 경유 + Tempo로 전환 (Sentry SDK가 이미 OTel 기반이라 마이그레이션 가능)

## Cross-references

- 원안: [#490](https://github.com/skku-amang/main/issues/490)
- v1 PR (merged then superseded): [#491 ADR initial](https://github.com/skku-amang/main/pull/491)
- v1 Phase 1 PR (closed): [#498](https://github.com/skku-amang/main/pull/498)
- v2 PR (closed): [#502](https://github.com/skku-amang/main/pull/502)
- Sentry-triage 스킬: [#456](https://github.com/skku-amang/main/pull/456)
- 분석 인프라 에픽 (보류, 본 ADR로 부분 재오픈 가능): [#434](https://github.com/skku-amang/main/issues/434), [#435](https://github.com/skku-amang/main/issues/435), [#436](https://github.com/skku-amang/main/issues/436)
- 홈랩 observability 스택: [homelab repo k8s/observability/](https://github.com/manamana32321/homelab/tree/main/k8s/observability)

## 변경 이력

- **2026-05-05 v3**: Signal split 모델로 재작성. 핵심 인사이트는 두 가지:
  1. `@sentry/nestjs` v10이 내부적으로 OpenTelemetry를 wrap한다는 사실 — "Sentry vs OTel" 이분법 outdated
  2. v1 PR #498의 진짜 비용 원인은 "한 신호 fan-out 설계"였지 "Sentry+OTel 공존"이 아니었음
     v2의 over-correction을 거부하고 v0 코드 상태(현 main)에 정합하는 ADR로 명문화. 이 journey에서 v1·v2의 거부 사유를 Alternatives Considered에 enumerate
- **2026-05-05 v2**: KISS 원칙 충실 — OTelcol single egress 모델 → Tier split 모델로 재작성. PR #502에 작성됐으나 머지 전 v3 검토 거쳐 close
- **2026-05-05 v1**: 초안 작성 → 결정 4건 채움 → Accepted. PR #491로 머지됨
