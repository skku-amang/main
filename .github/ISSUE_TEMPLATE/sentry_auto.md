---
name: "🤖 Sentry 자동 유입"
about: sentry-triage 스킬이 자동 생성하는 이슈 포맷 (사람이 직접 쓸 일은 거의 없음).
title: ""
labels: "kind: bug, from: sentry"
assignees: ""
---

<!--
이 템플릿은 `.claude/skills/sentry-triage/SKILL.md` 스킬이 GH 이슈를 자동 생성할 때 사용합니다.
{{...}} 플레이스홀더는 Sentry MCP 데이터로 치환됩니다.

사람이 직접 사용할 때는 해당 필드를 Sentry 이슈 페이지에서 복사해 채우세요.
-->

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
