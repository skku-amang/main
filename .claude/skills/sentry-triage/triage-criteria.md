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

## 보정 규칙 (post-classification adjustments)

분류 후 다음 신호가 있으면 라벨/우선순위를 한 단계 상향.

### 중복 요청 → priority 상향 (소셜 voting)

**서로 다른 유저가 같은 요청·증상을 독립적으로 제기**하면 priority를 한 단계 올린다 (`low → high`, `high → critical`).

- 매칭 기준: 키워드(예: "멤버 검색", "이름 검색") + 동일 페이지/flow + 다른 user.email
- 신규 이슈를 만들지 말고 **원본 이슈에 코멘트로 voter 추가** + 원본 priority 갱신
- Sentry에서 후속 이슈는 resolved 처리 + `Duplicate of WEB-XX` 코멘트

**예 (실 사례)**:

- WEB-12 (남승민, 2026-04-12): "멤버 추가 시 이름 검색 가능하면 어떨까"
- WEB-14 (임태웅, 2026-04-16): "이름 검색 + 기수 표기 됐으면"
- → WEB-14를 WEB-12 duplicate로 처리, WEB-12 priority `low → high`

### 외부 실유저 제보 → priority 상향

`user.email` 도메인이 팀 멤버(@manamana32321, @nhjbest22, @ssukim 등)가 아닌 외부 실유저면 priority 한 단계 상향. 외부 유저가 피드백 줄 만큼 불편을 느꼈다는 신호.

### 한 피드백에 여러 요청 묶임 → 분리

피드백 본문에 번호 매겨진 요청이 2개 이상이면 GH 이슈를 **각각 분리해서 생성**. 한 이슈에 묶으면 부분 구현 시 close 애매해짐.

---

## 조정 이력

이 문서는 **사용하며 진화**하는 기준이다. 실제 트리아지에서 기준과 판단이 어긋난 케이스를 기록한다.

<!-- 예시
### 2026-04-15
- `ResizeObserver loop limit exceeded`를 🚫로 자동 분류했는데, 모바일에서 실제 UX 문제였음.
  → 무해 목록에서 제거하고 📝로 처리하도록 변경.
-->

(아직 비어 있음)
