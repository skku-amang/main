# AMANG 도메인 용어집

본 파일은 AMANG 코드베이스에서 사용되는 도메인 용어의 **SSOT**. 새 feature·문서·코드 작성 시 동일 어휘 사용. 새 용어 도입 시 본 파일 먼저 업데이트.

---

## 핵심 엔티티 (현 Prisma schema 기반)

엔티티의 정확한 필드는 [packages/database/prisma/schema.prisma](../../packages/database/prisma/schema.prisma) 참조.

### Performance / 공연
음악 동아리의 행사 단위. AMANG의 한 공연 = 한 피드백 라이프사이클의 단위.
- 데이터: `Performance` 엔티티 ([schema.prisma:96-112](../../packages/database/prisma/schema.prisma#L96-L112))
- 한 공연 안에 다수의 Team

### Team / 팀
한 공연 내 한 곡을 맡은 멤버 그룹. leader 1명 + 세션별 멤버.
- 데이터: `Team` 엔티티
- `Team.performanceId` → Performance에 종속

### Session / 세션
보컬·기타·베이스·드럼·신디·현악기·관악기 등 **악기 역할**. ⚠️ 일반 IT의 "세션(HTTP session)"과 다름.
- 데이터: `Session` 엔티티 + `SessionName` enum

### Generation / 기수
동아리 입회 기수. User는 한 Generation에 종속. 기수마다 leader 1명 (= **기장**, 아래 운영·권한 어휘 참조).

### User
동아리원. `User.isAdmin = true`이면 운영진.

### Equipment / EquipmentRental
동아리 장비·대여. 본 문서 다른 도메인이라 짧게만.

---

## 피드백 시스템 도메인

본 도메인은 **개발 중**.

### 곡 (Song)
팀이 무대에 연주하기로 선정한 음악. **메타데이터로만 표현** — 제목, 원곡 아티스트, 장르, 길이 등.
- 데이터: `Team.songName`, `Team.songArtist`
- 시점: 공연 라이프사이클 RECRUITING 단계에 신청

### 녹음본 (Recording)
팀이 피드백용으로 제출한 **음원·영상 파일**. **곡과 구분 필요** — 곡은 추상적 음악, 녹음본은 그 곡을 팀이 연주한 결과물 파일.
- 데이터 (계획): MinIO `recordingFileKey`. 기존 운영은 `Team.songYoutubeVideoUrl`로 표현 (마이그레이션 대상).
- 시점: SUBMISSION 단계에 업로드
- 의미: **피드백의 직접 대상물**

### 피드백 (Feedback)
피드백 작성자가 한 녹음본에 대해 입력하는 데이터 = **점수 + 코멘트**.
- 점수: scoring=true 항목들의 numeric 값 → 채택 결정에 사용
- 코멘트: scoring=false 텍스트 항목 → 작성팀에게 알림 전달 (점수와 분리)
- EVALUATION 상태에서 입력. 시스템 이름 자체이기도 함.

### 피드백 작성자 (Reviewer)
본 시스템에서 피드백을 입력하는 사람. 본인 팀 외 모든 신청 팀의 녹음본에 대해 입력 의무.

### Pay-to-vote
peer review 패턴. 본인 팀 외 모든 팀에 피드백 미참여 시 본인 팀 채택 후보에서 페널티. 학술 리뷰·GitHub PR 리뷰의 호혜 메커니즘과 동일. v0.1은 팀 단위 강제.

### 공연 라이프사이클 6단계
`PREPARING → RECRUITING → SUBMISSION → EVALUATION 🔒 → DECISION → DONE`. EVALUATION 진입 시 팀 구성·곡 메타·녹음본 모두 freeze.

> 코드 식별자(`EVALUATION` 등)는 영문 enum 유지. 한국어 본문은 "피드백 단계" 등 풀어서 사용.

---

## 운영·권한 어휘

### 운영진
`User.isAdmin = true`인 사용자. 공연 셋업·채택 결정 권한.

### 회장 (President)
동아리 최고 운영 권한자. **현재 schema에 별도 모델 없음** — v0.1은 isAdmin 단일 레이어, 운영 컨벤션으로 "회장이 합의 게이트 누름". v2에서 별도 role 컬럼 또는 RBAC 모델링 계획.

### 기장 (Generation Leader)
한 Generation(기수)의 대표 **타이틀 역할**. `Generation.leader` 필드. **권한 추가 없음** — 회장과 완전 독립. 명예직.

> 따라서 합의 게이트 권한자 식별에 `Generation.leader` 활용 불가. v2에서 별도 모델링 필요.

---

## 어휘 사용 원칙

1. **곡 vs 녹음본** — 메타데이터·운영 맥락은 곡, 파일·피드백 대상은 녹음본
2. **피드백 vs 평가** — 사용자 입력 행위는 일관되게 "피드백" (시스템 이름과 일관성). "평가"는 변수명·코드 enum (`Evaluation`, `EVALUATION`)으로만 잔존
3. **운영진 / 회장 / 기장** — 권한 root는 운영진(isAdmin), 합의 게이트는 회장(v2 모델), 기장은 명예직 (권한 0)
4. **상태 머신 enum 영문 유지** — 코드 식별자는 영문, 한국어 본문에서 풀어 사용

---

## 변경 이력

- **2026-05-05**: 본 파일 신설. 피드백 시스템 도메인 추가 (곡/녹음본/피드백/피드백 작성자/Pay-to-vote/공연 라이프사이클). 회장·기장 명확 분리.
