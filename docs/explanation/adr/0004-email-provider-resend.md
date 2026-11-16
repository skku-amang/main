# ADR-0004: 메일 발송은 Resend

**작성일**: 2026-11-16
**상태**: Accepted
**작성자**: 손장수 (+ Claude)
**관련 이슈**: [#528](https://github.com/skku-amang/main/issues/528)

## Context

비밀번호 찾기([#528](https://github.com/skku-amang/main/issues/528))를 하려면 본인 메일로 인증번호를 보내야 한다. 아망에는 메일을 보내는 수단이 없다. 알림 시스템은 이메일을 범위 밖으로 두었다 ([ADR-0003](0003-web-push-notification-channel.md)).

보낼 양은 적다. 부원 100여 명이 가입할 때와 비밀번호를 잊었을 때만 보내므로, 많아야 하루 수십 통이다. 운영은 1인이라 계정·키 관리가 단순해야 하고, 학생 동아리라 비용은 0이 좋다.

## Alternatives Considered

### Option 1: Resend 무료

- **장점**: 하루 100통·월 3,000통까지 무료. HTTP API 하나라 SDK 없이 `fetch`로 보낸다. 보내는 주소를 `amang.json-server.win` 도메인으로 쓸 수 있고, 필요한 DNS 레코드는 homelab Cloudflare Terraform에 선언적으로 넣는다
- **단점**: 외부 SaaS 하나가 늘어난다. 무료 한도를 넘으면 그날은 못 보낸다

### Option 2: AWS SES

- **장점**: 선호 스택(AWS). 대량 발송에도 싸다
- **단점**: 1,000통에 약 0.1달러로 비용이 생긴다. 처음엔 시험 모드라 아무에게나 보내지 못해 해제 신청이 필요하다. 아망용 AWS 계정·IAM을 새로 준비해야 한다

### Option 3: Gmail SMTP

- **장점**: 동아리 Gmail 계정과 앱 비밀번호만 있으면 된다. DNS 작업이 없다
- **단점**: 보내는 사람이 개인 지메일 주소로 보인다. 계정 2단계 인증과 앱 비밀번호를 사람 계정에 묶어야 한다

## Decision

Resend 무료를 쓴다. 보낼 양이 무료 한도의 몇 분의 일이라 비용이 들지 않는다. 보내는 주소가 사이트 도메인이라 부원이 스팸으로 오해할 일이 적다. API가 HTTP 한 번이라 바꾸기도 쉽다. 발송 코드는 `MailService` 한 곳에만 둔다.

## Consequences

- **좋은 결과**: 비용 0. 보내는 주소 `no-reply@amang.json-server.win`. DNS는 선언적으로 관리된다
- **나쁜 결과**: 하루 100통을 넘으면 그날은 발송이 실패한다. 지금 규모에서는 일어나기 어렵다
- **중립적 결과**: `RESEND_API_KEY`가 없으면(로컬 개발) 메일을 보내지 않고 내용을 로그에 남긴다. 스테이징의 봇 가입은 실제로 보내지 않는다 ([이메일 인증·비밀번호 찾기 설계](../design/email-verification-password-reset.md#스테이징-봇))
