# Sentry Triage 분류 기준

각 Sentry 이슈·피드백을 아래 5라벨 중 하나로 분류한다. 우선순위가 높은 것부터 검사하여 첫 매치에서 확정.

## 🔥 즉시 수정 (priority: critical)

다음 중 **하나라도** 해당:

- 영향 유저 수 ≥ 5명
- 최근 24시간 이벤트 수가 기저(지난 7일 평균) 대비 5배 이상
- 핵심 flow 키워드가 스택트레이스·URL·메시지에 포함:
  `login`, `auth`, `signup`, `payment`, `reservation`, `booking`, `equipment`

## 🚫 무시 추천 (priority: 없음, 사용자가 수동 archive)

다음 중 **하나라도** 해당:

- 에러 타입이 알려진 무해: `ChunkLoadError`, `AbortError`, `ResizeObserver loop limit exceeded`, `Network request failed`(취소 컨텍스트)
- User-Agent에 봇 패턴: `bot`, `crawler`, `spider`, `HeadlessChrome`(테스트 외)
- 개발 환경(`environment: development` 또는 `local`)

## 💡 기능 요청 (User Feedback 전용)

**User Feedback일 때만** 다음 패턴 매치:

- "있으면 좋겠다", "추가해 주세요", "~할 수 있나요" (의문문이 아닌 요청문)
- "~하고 싶어요" + 현재 불가능한 동작
- 에러 증상 언급 없음

에러 키워드("에러", "안 돼요", "작동 안 함", "실패" 등)가 포함되면 버그로 분류.

## 📝 이슈 등록 (priority: high 또는 low)

다음 **전부** 해당:

- 위 🔥/🚫/💡에 해당하지 않음
- 재현 가능한 스택트레이스 존재
- 영향 유저 ≥ 1명

영향 유저 ≥ 3명이면 `priority: high`, 그 외 `priority: low`.

## 👀 관찰 (priority: low)

나머지 전부. 예:

- 유저 1명, 재발 없음
- 새 유형이라 영향도 판단 불가

---

## 조정 이력

이 문서는 **사용하며 진화**하는 기준이다. 실제 트리아지에서 기준과 판단이 어긋난 케이스를 기록한다.

<!-- 예시
### 2026-04-15
- `ResizeObserver loop limit exceeded`를 🚫로 자동 분류했는데, 모바일에서 실제 UX 문제였음.
  → 무해 목록에서 제거하고 📝로 처리하도록 변경.
-->

(아직 비어 있음)
