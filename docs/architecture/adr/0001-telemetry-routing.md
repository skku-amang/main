# ADR-0001: 텔레메트리 라우팅 — OTelcol 단일 egress + Sentry 역할 분담

**작성일**: 2026-05-05
**상태**: Accepted
**작성자**: JSON (+ Claude Code 협업)
**관련 이슈**: [#490](https://github.com/skku-amang/main/issues/490)

## Context

현재 AMANG의 텔레메트리 수집은 두 스택이 단절된 상태로 가동 중이다.

| 신호 | FE (`apps/web`) | BE (`apps/api`) |
|---|---|---|
| Logs | SSR pod stdout만 (Promtail→Loki) | pino → stdout → Loki |
| Metrics | 없음 (Vercel Analytics는 페이지뷰만) | 앱 메트릭 없음 |
| Traces | Sentry (`tracesSampleRate: 1.0`) | Sentry + Profiling |
| Errors / Replay / Feedback | Sentry SDK 직송 | Sentry SDK 직송 |

홈랩 K3s에는 이미 다음 관측성 스택이 가동 중이다:

| 컴포넌트 | 매니페스트 | 비고 |
|---|---|---|
| **OTel Collector** | [k8s/observability/otel-collector/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/otel-collector) | OTLP receiver, 3-way fan-out (Loki/Prometheus/Tempo) 구성됨 |
| **Loki** | [k8s/observability/loki/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/loki) | logs |
| **Prometheus** | [k8s/observability/prometheus/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/prometheus) | metrics |
| **Tempo** | [k8s/observability/tempo/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/tempo) | traces, single binary, 30d retention |
| **Grafana** | [k8s/observability/grafana/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/grafana) | UI |
| **Promtail** | [k8s/observability/promtail/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/promtail) | stdout 수집 → Loki |
| **Blackbox Exporter** | [k8s/observability/blackbox-exporter/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/blackbox-exporter) | 외부 가용성 |

아망 앱이 Sentry로 직송하는 구조라 두 관측 스택이 단절되어 있다. 홈랩 OTelcol에 아망 신호가 들어오지 않고 있다.

이 ADR은 **앱이 텔레메트리를 어디로 보내는가**(transport)와 **데이터가 최종 어디에 저장·조회되는가**(destination)를 명시적으로 분리해 결정한다.

## Decision

### 핵심 원칙

> 모든 런타임 텔레메트리는 OTLP로 OTel Collector에 보낸다. OTel 스펙으로 표현 불가능한 3가지 (Session Replay / Feedback widget / Source maps) 만 Sentry SDK·CLI로 직송하며, 이 예외는 본 ADR에 enumerate된 것이 전부다. 새 직송 추가는 본 ADR 개정을 요구한다.

### 신호별 라우팅

| 신호 | App emits via | Final backend |
|---|---|---|
| Application errors | OTel | Sentry (+ Loki 사본) |
| FE Web Vitals | OTel metrics | Sentry + Prometheus |
| FE console error/warn | OTel logs | Sentry |
| BE HTTP / Prisma traces | OTel | Sentry + Tempo (양쪽) |
| BE application logs (pino) | stdout (당분간) | Loki |
| BE custom metrics | OTel metrics | Prometheus |
| Pod / Node metrics | (앱 외부) Prometheus scrape | Prometheus |
| Blackbox 가용성 | (앱 외부) Prometheus | Prometheus |
| **Session Replay** | **Sentry SDK 직송** (예외) | Sentry |
| **Feedback widget** | **Sentry SDK 직송** (예외) | Sentry |
| **Source maps** | **sentry-cli (build-time)** (예외) | Sentry |

### 아키텍처 다이어그램

```
                              ┌──→ Sentry      (errors / user-facing traces / FE Vitals)
                              │
앱 (OTel SDK) ──→ OTelcol─────┼──→ Loki        (logs, OTLP path)
  ├─ apps/web                  │
  └─ apps/api                  ├──→ Prometheus  (metrics)
                              │
                              └──→ Tempo       (traces, 30d retention)

[OTelcol 우회 — 3가지 예외만]
apps/web ──Sentry SDK 직송──→ Sentry  (Replay, Feedback widget)
CI       ──sentry-cli────────→ Sentry  (Source maps, build-time)

[앱 외부 — 항상 직접]
kube-state-metrics ──→ Prometheus
Blackbox Exporter  ──→ Prometheus
apps/* pod stdout  ──Promtail──→ Loki  (현행 유지, 결정 4)
```

---

## 결정 항목

### 결정 1: Tempo 활용 방식

**상황**: 홈랩에 Tempo가 이미 가동 중 ([k8s/observability/tempo/](https://github.com/manamana32321/homelab/tree/main/k8s/observability/tempo)). single binary mode, OTLP gRPC `tempo.observability.svc.cluster.local:4317`, 30일 retention, local-path-hdd-samsung 스토리지. **신규 도입 결정이 아니라 활용 방식 결정**.

**결정**: 활용 ✅ — BE traces를 Sentry와 Tempo **양쪽**으로 fan-out

**근거**:
- 인프라 이미 존재 → 도입 비용 0
- Sentry 90일 vs Tempo 30일 — 둘 다 hot 영역. **Sentry는 user-incident 디버깅 UI가 강하고, Tempo는 Grafana exemplar·PromQL 연동이 강함** → 같은 trace에서 다른 분석 관점 동시 활용
- 30일 retention은 capacity-planning에 충분 (장기 통계는 Prometheus aggregate)
- OTelcol에 Tempo exporter `otlp/trace`가 이미 구성됨 → 추가 작업 없음

---

### 결정 2: Sampling 전략

**결정**: A — Full rate (`tracesSampleRate: 1.0`)

**근거**:
- 현재 트래픽 규모(일 수백명)에서 Sentry 무료 티어 quota 부담 없음
- Tempo는 자체 호스팅이라 비용 압박 없음
- Tail sampling 도입은 **Collector pipeline 변경만으로 후속 전환 가능 (앱 재배포 불필요)** — late binding의 가치
- 부활 조건: **Sentry 무료 티어 quota 80% 도달 시** tail sampling으로 전환 (에러 100% + 정상 1%, slow 100%)

---

### 결정 3: FE OTel 도입 시점

**결정**: B — FE는 Sentry SDK 유지, OTel 도입 보류

**근거**:
- Browser OTel SDK 미성숙 (`@opentelemetry/sdk-trace-web`은 GA 직전 단계)
- Sentry의 강점이 FE에 집중됨: Session Replay, Feedback widget, Source map auto-upload, breadcrumbs — OTel이 대체 불가능한 영역이 큼
- 본 ADR의 핵심 원칙("OTLP로 통일")과 부분 충돌 → **예외로 명시적 enumerate**
- 부활 조건: Browser OTel SDK GA + Web Vitals OTel metrics 안정화 (6개월 후 재평가)

---

### 결정 4: Logs OTel 도입 시점

**결정**: B — pino → stdout → Promtail 경로 유지

**근거**:
- 현행 구조 안정적: nestjs-pino가 [JWT userId/X-Request-Id 자동 첨부 + redact](../../../apps/api/src/common/logger/pino-logger.config.ts) 등 충실
- pino → OTel transport 라이브러리 추가는 **순(net) 개선 아님** — Loki는 어차피 통과하고 trace ID는 코드에서 박을 수 있음
- 본 ADR Phase 4에서 **trace ID를 pino log에 자동 첨부**하여 Sentry/Tempo와 jump 가능하게 만드는 것이 봉합점
- 부활 조건: BE OTel traces 1개월 안정 가동 후 OTel Logs 도입의 실익 재평가

---

## Consequences

**기대 효과**:
- 앱 코드의 라우팅 결정 0 — Collector config가 SSOT (homelab repo GitOps로 관리)
- 데스티네이션 추가/제거가 앱 재배포 없이 가능 — 1인 운영자 결정 부담 ↓
- Sentry 의존도 명시적 enumerate → 벤더 lock-in 가시화
- Trace ID 양쪽 보존으로 incident 디버깅 시 hot store(Sentry) ↔ warm store(Tempo/Loki) jump 가능
- 홈랩 OTelcol baseline 활용 → 신규 인프라 컴포넌트 배포 0

**비용/위험**:
- BE OTel 도입 시 `@sentry/nestjs` trace 자동 instrumentation과 OTel auto-instrumentation 충돌 가능성 — Sentry SDK는 errors/profiling만 남기고 traces는 OTel로 위임 필요
- Sentry exporter는 OTelcol에서 별도 추가 필요 (`otlphttp/sentry` 또는 community contrib `sentryexporter`)
- FE OTel 보류는 일관성 비용 — ADR 예외 처리로 명시
- Sentry OTLP traces ingest는 organization plan 활성화 확인 필요 (Phase 0)

**OTelcol 변경 범위 (Phase 2 scope)**:
- 추가: Sentry exporter (`otlphttp/sentry`)
- 추가: 라우팅 (errors → Sentry+Loki 사본 / traces → Sentry+Tempo)
- 유지: 기존 OTLP receiver, Loki/Prometheus/Tempo exporter
- **신규 컴포넌트 배포 0** — 기존 collector values.yaml만 수정

## Alternatives Considered

### 대안 1: Sentry 일원화 (홈랩 폐기)

**거부 이유**:
- Pod CPU/메모리/디스크 메트릭 부재 → capacity planning 불가 (critical)
- PromQL/LogQL 표현력 손실
- Sentry quota 비용 급증 위험
- 무제한 log retention 손실
- 홈랩 관측성 스택(이미 운영 중) 자산 폐기

**부활 조건**: 사실상 없음. 홈랩 스택을 폐기할 일이 없는 한 부적합.

### 대안 2: 홈랩 스택 일원화 (Sentry 폐기)

**거부 이유**:
- 에러 그룹화/dedup 손실 — Loki에서 같은 에러 100번 다 따로 보임
- Source map 자동 적용된 stack trace 손실
- Session Replay 대체 거의 불가
- Feedback widget 직접 구현 부담
- breadcrumbs / user context 자동 첨부 손실
- sentry-triage 스킬([#456](https://github.com/skku-amang/main/pull/456)) 자산 폐기
- 셀프호스팅 Sentry 가능하지만 1인 인프라 운영 부담 위 (PostgreSQL HA + ClickHouse + Symbolicator)

**부활 조건**: Sentry SaaS 가격 정책 급변 또는 데이터 주권 요구 발생 시.

### 대안 3: 앱 직송 (현재 상태) 유지

**거부 이유**:
- 앱이 destination 결정 책임을 짐 → 변경 시 앱 재배포 필요
- 라우팅 로직이 앱 코드에 분산 → SSOT 부재
- 두 스택의 봉합점(trace ID correlation) 구현 어려움
- 홈랩 OTelcol baseline 미활용

**부활 조건**: 없음. 본 ADR이 거부하려는 상태.

---

## 후속 작업 (구현 이슈로 분기)

본 ADR이 `Accepted`된 후 아래 이슈를 생성한다.

- [ ] **Phase 0**: Sentry OTLP ingest 활성화 확인 (organization plan, endpoint, auth header 형식)
- [ ] **Phase 1**: BE OTel SDK 도입 ([apps/api/src/instrument.ts](../../../apps/api/src/instrument.ts) 확장 — `@opentelemetry/sdk-node` + auto-instrumentation, Sentry SDK는 errors/profiling만)
- [ ] **Phase 2**: Collector pipeline 확장 (homelab repo PR — Sentry exporter 추가, 라우팅 — **기존 OTelcol values.yaml 수정만**)
- [ ] **Phase 3**: Trace ID correlation 봉합 (pino log에 `trace_id` 자동 첨부, Grafana 대시보드 trace ID input → Sentry/Tempo/Loki jump 링크)
- [ ] **Phase 4**: API `/metrics` exporter (`@willsoto/nestjs-prometheus` + ServiceMonitor) — OTel metrics와 별개로 RED 메트릭 SLO 정의용
- [ ] **Phase 5** (선택): FE consoleLoggingIntegration 활성화 — Sentry SDK 유지 결정의 부수 작업

> Phase 5 (Tempo 배포)는 **삭제** — 이미 가동 중.

## Cross-references

- 이슈: [skku-amang/main#490](https://github.com/skku-amang/main/issues/490)
- 보류된 분석 인프라 에픽: [#434](https://github.com/skku-amang/main/issues/434), [#435](https://github.com/skku-amang/main/issues/435), [#436](https://github.com/skku-amang/main/issues/436) (PostHog 보류, 본 ADR과 독립)
- 살아있는 [#437 회원가입 CRO](https://github.com/skku-amang/main/issues/437) (본 ADR과 무관)
- 홈랩 observability 스택: [homelab repo k8s/observability/](https://github.com/manamana32321/homelab/tree/main/k8s/observability)
- 관련 sentry-triage 스킬 PR: [#456](https://github.com/skku-amang/main/pull/456)

## 변경 이력

- **2026-05-05**: 초안 작성 → 결정 4건 채움 → Accepted. 결정 1은 "Tempo 도입 여부" 가 아니라 "이미 가동 중인 Tempo의 활용 방식"으로 정정 (인프라 inventory 누락이 초안 작성 중 발견됨).
