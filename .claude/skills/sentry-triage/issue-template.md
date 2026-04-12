# GH 이슈 body 템플릿

스킬이 GH 이슈를 자동 생성할 때 이 템플릿을 사용한다. `{{...}}` 플레이스홀더는 Sentry MCP 데이터로 치환.

---

~~~markdown
> **Source**: [Sentry 이슈]({{sentry_permalink}})
> **영향**: 유저 {{user_count}}명 / 이벤트 {{event_count}}건 / 최근 발생: {{last_seen}}

## 요약

{{message_or_feedback}}

## 스택트레이스

```
{{stack_top_10_lines}}
```

## 재현 조건 (추정)

- URL: {{url}}
- 브라우저: {{browser}}
- 환경: {{environment}}
- 릴리스: {{release}}

## User Feedback (있을 경우)

> {{user_feedback_text}}

---

_이 이슈는 `sentry-triage` 스킬로 자동 생성되었습니다._
~~~

## 제목 규칙

CONTRIBUTING.md의 "이슈 제목 — 자연어로" 원칙에 따라 **Conventional Commits 포맷 사용 금지**.

- **Sentry 유입**: 에러 메시지 그대로 사용
  - 예: `로그인 시 TypeError: Cannot read 'user' of undefined`
- **User Feedback**: 유저 원문 또는 요약
  - 예: `예약 목록을 엑셀로 내보낼 수 있었으면 좋겠어요`

## 빈 필드 처리

플레이스홀더의 값이 없을 경우:

- 스택트레이스 없음: "스택트레이스" 섹션 전체 생략
- User Feedback 없음: "User Feedback" 섹션 전체 생략
- URL/브라우저 등 개별 태그 없음: 해당 줄만 생략

섹션을 비워두지 말고 아예 빼서 노이즈 최소화.
