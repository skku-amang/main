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
- **스택트레이스 전체가 서드파티 코드에서만 발생**: `_next-live/feedback/*`(Vercel Live Feedback), `_next/static/chunks/*`에서만 발생하고 우리 소스(`apps/web/**`, `apps/api/**`)는 한 프레임도 포함 안 됨 → 라이브러리 버그, 우리 소관 아님
- `mechanism: auto.browser.browserapierrors.*` 태그가 붙은 자동 수집 브라우저 API 에러 (대개 사용자 조작 잡음)

## 💡 기능 요청 (User Feedback 전용)

**User Feedback일 때만** `event.contexts.feedback.message` 원문(대부분 한국어)에서 다음 패턴 매치:

- 요청문: "있으면 좋겠다", "좋을 듯", "추가해 주세요", "~할 수 있나요"
- 필요성 표현: "~ 필요", "추가 필요", "수정 필요", "~하면 좋겠다"
- 욕구 표현: "~하고 싶어요" + 현재 불가능한 동작
- 에러 증상 언급 없음

에러 키워드("에러", "안 돼요", "작동 안 함", "실패", "안됨", "리다이렉트 안됨" 등)가 포함되면 버그로 분류.

**주의**: Sentry가 자동 생성한 영문 title/description 말고 **원문**으로 판단. 예:

- WEB-10 원문 "회원 관리에서 기수 인라인 필드 수정 기능 추가 필요" → "필요" 패턴 매치 → 💡
- WEB-X 원문 "로그인 됐는데도 불구하고 다른 페이지로 리다이렉트 안됨" → "안됨" 매치 → 버그 (📝 또는 🔥)

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
