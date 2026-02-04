# DOC-001: 프로젝트 개요 및 요구사항 명세서

> **문서 버전**: 1.0
> **최종 수정일**: 2026-02-04
> **작성 목적**: AI가 프로젝트를 처음부터 재구성할 수 있도록 비즈니스 요구사항과 기능 범위를 정의

---

## 1. 프로젝트 배경

### 1.1 조직 소개

**AMANG (아망)**은 성균관대학교 밴드 동아리입니다.

- **활동 내용**: 정기 공연, 밴드 합주, 장비 관리
- **구성원 규모**: 약 50~100명 (기수별 10~20명)
- **운영 방식**: 기수(Generation) 단위로 신입 부원 모집, 세션(악기) 단위로 활동

### 1.2 기존 문제점

1. **공연 팀 모집의 비효율성**
   - 카카오톡/구글 폼을 통한 수동 모집
   - 중복 지원, 정원 초과 문제 발생
   - 실시간 현황 파악 어려움

2. **장비 및 동아리방 예약 충돌**
   - 수기 예약 또는 공유 캘린더 사용
   - 중복 예약 방지 불가
   - 예약 현황 공유 어려움

3. **회원 정보 관리의 분산**
   - 기수별 연락처, 세션 정보가 분산
   - 팀 구성 시 연락처 수집 번거로움

### 1.3 시스템 도입 목표

1. **팀 모집 자동화**: 실시간 지원/취소, 중복 방지, 정원 관리
2. **예약 시스템 통합**: 장비/동아리방 예약의 시간 충돌 자동 감지
3. **회원 정보 중앙화**: 기수, 세션, 연락처 통합 관리

---

## 2. 사용자 페르소나

### 2.1 일반 회원 (Member)

**특징**:

- 특정 기수(Generation)에 소속
- 하나 이상의 세션(악기) 담당
- 공연 팀에 지원하여 참여

**주요 행동**:

- 공연 목록 조회 및 팀 현황 확인
- 원하는 팀의 세션에 지원/취소
- 장비 또는 동아리방 예약
- 자신의 프로필 관리

**Pain Points**:

- 여러 팀에 동시 지원하고 싶을 때 관리 어려움
- 인기 세션의 경우 지원 경쟁 발생

### 2.2 팀 리더 (Team Leader)

**특징**:

- 일반 회원 중 팀을 생성한 사람
- 팀 정보 수정/삭제 권한 보유

**주요 행동**:

- 공연에 참여할 팀 생성
- 필요한 세션과 정원 설정
- 팀원 모집 현황 관리
- 팀 정보 수정/삭제

**Pain Points**:

- 다양한 세션 조합 설정의 복잡성
- 모집 마감 후 팀원 변경 필요 시

### 2.3 관리자 (Admin)

**특징**:

- 시스템 전체 관리 권한 보유
- `isAdmin: true` 플래그로 구분

**주요 행동**:

- 공연(Performance) 생성/수정/삭제
- 기수(Generation) 관리
- 세션(Session) 관리 (리더 지정 등)
- 장비(Equipment) 등록/관리
- 모든 팀/예약에 대한 수정/삭제 권한

**Pain Points**:

- 대량의 데이터 관리 필요
- 권한 남용 방지 필요

---

## 3. 핵심 기능 요구사항 (User Stories)

### 3.1 인증 및 회원 관리

#### US-AUTH-001: 회원가입

```
AS A 사용자
I WANT TO 이메일과 비밀번호로 회원가입
SO THAT 시스템을 이용할 수 있습니다.

Acceptance Criteria:
- 이메일 형식 검증
- 비밀번호: 최소 8자, 영문+숫자+특수문자 조합
- 닉네임 중복 검사
- 기수(Generation) 선택 필수
- 세션(Session) 최소 1개 선택 필수

Edge Cases:
- 이메일 중복 시: ConflictError("이미 존재하는 이메일입니다.")
- 닉네임 중복 시: ConflictError("이미 존재하는 닉네임입니다.")
```

#### US-AUTH-002: 로그인

```
AS A 회원
I WANT TO 이메일과 비밀번호로 로그인
SO THAT 인증된 기능을 이용할 수 있습니다.

Acceptance Criteria:
- 올바른 자격 증명 시 JWT 토큰 발급 (access + refresh)
- 잘못된 자격 증명 시 AuthError

Edge Cases:
- 존재하지 않는 이메일: AuthError("잘못된 이메일 또는 비밀번호입니다.")
- 잘못된 비밀번호: AuthError("잘못된 이메일 또는 비밀번호입니다.")
```

#### US-AUTH-003: 토큰 갱신

```
AS A 로그인된 회원
I WANT TO 만료된 액세스 토큰을 갱신
SO THAT 재로그인 없이 서비스를 계속 이용할 수 있습니다.

Acceptance Criteria:
- 유효한 refresh token으로 새 access token 발급
- 갱신 시 refresh token도 함께 갱신

Edge Cases:
- 만료된 refresh token: RefreshTokenExpiredError
- 유효하지 않은 refresh token: AuthError
```

#### US-AUTH-004: 로그아웃

```
AS A 로그인된 회원
I WANT TO 로그아웃
SO THAT 세션을 안전하게 종료할 수 있습니다.

Acceptance Criteria:
- 서버에 저장된 hashedRefreshToken 제거
- 클라이언트 토큰 폐기
```

### 3.2 공연 관리 (Performance)

#### US-PERF-001: 공연 목록 조회

```
AS A 사용자 (인증 불필요)
I WANT TO 전체 공연 목록을 조회
SO THAT 참여할 공연을 확인할 수 있습니다.

Acceptance Criteria:
- 공연명, 날짜, 장소, 포스터 이미지 표시
- 최신순 정렬 (기본)
```

#### US-PERF-002: 공연 상세 조회

```
AS A 사용자 (인증 불필요)
I WANT TO 특정 공연의 상세 정보를 조회
SO THAT 공연의 팀 구성 현황을 확인할 수 있습니다.

Acceptance Criteria:
- 공연 기본 정보 표시
- 해당 공연에 속한 팀 목록 표시
```

#### US-PERF-003: 공연 생성

```
AS A 관리자
I WANT TO 새로운 공연을 생성
SO THAT 팀 모집을 시작할 수 있습니다.

Acceptance Criteria:
- 필수 입력: 공연명
- 선택 입력: 설명, 포스터 이미지, 장소, 시작/종료 일시
- startAt < endAt 검증 (둘 다 입력된 경우)

Edge Cases:
- 종료 시간이 시작 시간보다 빠른 경우: ValidationError
```

#### US-PERF-004: 공연 수정

```
AS A 관리자
I WANT TO 공연 정보를 수정
SO THAT 변경된 정보를 반영할 수 있습니다.

Acceptance Criteria:
- 부분 업데이트 지원
- startAt < endAt 검증

Edge Cases:
- 존재하지 않는 공연: NotFoundError
- 동시 수정 시: Race Condition 처리 (P2025 → NotFoundError)
```

#### US-PERF-005: 공연 삭제

```
AS A 관리자
I WANT TO 공연을 삭제
SO THAT 취소된 공연을 정리할 수 있습니다.

Acceptance Criteria:
- 공연 삭제 시 속한 모든 팀도 CASCADE 삭제
- 삭제된 팀의 TeamSession, TeamMember도 CASCADE 삭제
```

### 3.3 팀 관리 (Team)

#### US-TEAM-001: 팀 목록 조회

```
AS A 사용자 (인증 불필요)
I WANT TO 공연의 팀 목록을 조회
SO THAT 지원할 팀을 찾을 수 있습니다.

Acceptance Criteria:
- 팀명, 곡명, 아티스트, 리더 정보 표시
- 각 팀의 세션별 모집 현황 표시 (모집 중/마감)
- 필터링: 세션별, 모집 상태별
```

#### US-TEAM-002: 팀 상세 조회

```
AS A 사용자 (인증 불필요)
I WANT TO 팀의 상세 정보를 조회
SO THAT 세션 구성과 멤버 현황을 확인할 수 있습니다.

Acceptance Criteria:
- 팀 기본 정보 (곡명, 아티스트, 유튜브 링크 등)
- 각 세션별 정원(capacity)과 현재 멤버
- 각 포지션(index)의 지원자 정보
```

#### US-TEAM-003: 팀 생성

```
AS A 로그인된 회원
I WANT TO 새로운 팀을 생성
SO THAT 공연에 참여할 밴드를 모집할 수 있습니다.

Acceptance Criteria:
- 필수 입력: 팀명, 곡명, 아티스트, 공연 ID, 세션 구성
- 선택 입력: 설명, 포스터, 유튜브 URL, 신입생 고정, 자작곡 여부
- 세션 구성 시 각 세션의 capacity(정원) 지정
- 초기 멤버 배정 가능 (리더 자신 등)

Edge Cases:
- 존재하지 않는 공연: ReferencedEntityNotFoundError
- 존재하지 않는 세션: ReferencedEntityNotFoundError
- 같은 팀에 동일 세션 중복: DuplicateTeamSessionError
- 멤버 index가 capacity 초과: InvalidMemberIndexError
- 같은 세션 내 index 중복: DuplicateMemberIndexError
- 같은 세션 내 사용자 중복: DuplicateSessionUserError
```

#### US-TEAM-004: 팀 수정

```
AS A 팀 리더 또는 관리자
I WANT TO 팀 정보를 수정
SO THAT 변경된 정보를 반영할 수 있습니다.

Acceptance Criteria:
- 팀 리더 또는 관리자만 수정 가능
- 세션 구성 변경 가능 (추가/삭제/수정)
- 트랜잭션으로 원자성 보장

Edge Cases:
- 권한 없음: ForbiddenError
- 존재하지 않는 팀: NotFoundError
```

#### US-TEAM-005: 팀 삭제

```
AS A 팀 리더 또는 관리자
I WANT TO 팀을 삭제
SO THAT 취소된 팀을 정리할 수 있습니다.

Acceptance Criteria:
- 팀 리더 또는 관리자만 삭제 가능
- TeamSession, TeamMember CASCADE 삭제
```

#### US-TEAM-006: 팀 세션에 지원 (Apply)

```
AS A 로그인된 회원
I WANT TO 팀의 특정 세션에 지원
SO THAT 팀에 참여할 수 있습니다.

Acceptance Criteria:
- 여러 세션에 동시 지원 가능 (하나의 요청으로)
- 각 세션의 특정 index(포지션)에 지원

Validation Rules:
1. 해당 세션이 팀에 존재하는가?
2. 지원하려는 index가 1 ~ capacity 범위인가?
3. 이미 해당 세션에 지원했는가? → DuplicateApplicationError
4. 해당 index에 다른 사람이 있는가? → PositionOccupiedError

Edge Cases (Race Condition):
- 동시에 같은 포지션 지원 시:
  - DB Unique 제약 (teamSessionId, index)으로 1명만 성공
  - P2002 에러 → PositionOccupiedError로 변환
- 동시에 같은 세션 중복 지원 시:
  - DB Unique 제약 (teamSessionId, userId)으로 방지
  - P2002 에러 → DuplicateApplicationError로 변환
```

#### US-TEAM-007: 팀 세션 지원 취소 (Unapply)

```
AS A 로그인된 회원
I WANT TO 지원한 세션을 취소
SO THAT 다른 팀에 지원할 수 있습니다.

Acceptance Criteria:
- 본인이 지원한 건만 취소 가능
- 여러 세션 동시 취소 가능

Edge Cases:
- 해당 세션이 팀에 없음: SessionNotFoundError
- 해당 세션에 지원 기록 없음: NoApplicationFoundError
- 다른 사람의 지원 취소 시도: ForbiddenError
```

### 3.4 장비 및 예약 관리 (Equipment & Rental)

#### US-EQUIP-001: 장비 목록 조회

```
AS A 로그인된 회원
I WANT TO 장비 목록을 조회
SO THAT 대여 가능한 장비를 확인할 수 있습니다.

Acceptance Criteria:
- 카테고리별 필터링: type=room (동아리방) / type=item (일반 장비)
- 브랜드, 모델명, 사용 가능 여부 표시
```

#### US-EQUIP-002: 장비 등록

```
AS A 관리자
I WANT TO 새로운 장비를 등록
SO THAT 회원들이 대여할 수 있습니다.

Acceptance Criteria:
- 필수: 카테고리, 브랜드, 모델명
- 선택: 설명, 이미지, 사용 가능 여부
```

#### US-RENTAL-001: 장비/동아리방 예약

```
AS A 로그인된 회원
I WANT TO 장비 또는 동아리방을 예약
SO THAT 특정 시간에 사용할 수 있습니다.

Acceptance Criteria:
- 예약 시간 (startAt, endAt) 지정
- 예약자 목록 (복수 가능)
- 예약 제목 입력

Validation Rules:
- startAt < endAt
- 동일 장비의 시간 충돌 검사

Time Conflict Detection:
기존 예약과 겹치는 조건:
- existingRental.startAt < newEndAt AND existingRental.endAt > newStartAt

Edge Cases:
- 시간 충돌 시: ConflictError("해당 시간에 이미 예약이 존재합니다.")
- 존재하지 않는 장비: NotFoundError
```

#### US-RENTAL-002: 예약 조회

```
AS A 로그인된 회원
I WANT TO 예약 현황을 조회
SO THAT 가능한 시간을 확인할 수 있습니다.

Acceptance Criteria:
- 기간별 필터링 (from, to)
- 타입별 필터링 (room/item)
- 장비별 필터링 (equipmentId)
- 기본 조회 범위: 이전 1달 ~ 이후 2달
```

#### US-RENTAL-003: 예약 수정/삭제

```
AS A 예약 생성자 또는 관리자
I WANT TO 예약을 수정하거나 삭제
SO THAT 변경된 일정을 반영할 수 있습니다.

Acceptance Criteria:
- 예약 생성자 또는 관리자만 가능
- 시간/장비 변경 시 충돌 재검사

Edge Cases:
- 권한 없음: ForbiddenError
- 수정 후 시간 충돌: ConflictError
```

### 3.5 기수 및 세션 관리

#### US-GEN-001: 기수 관리

```
AS A 관리자
I WANT TO 기수를 생성/수정/삭제
SO THAT 연도별 회원을 구분할 수 있습니다.

Acceptance Criteria:
- 기수 번호(order)는 유니크
- 기수장(leader) 지정 가능

Edge Cases:
- 기수 번호 중복: ConflictError
- 소속 회원이 있는 기수 삭제 시도: ConflictError(참조 무결성)
```

#### US-SESSION-001: 세션 관리

```
AS A 관리자
I WANT TO 세션을 관리
SO THAT 악기 세션을 체계적으로 운영할 수 있습니다.

Acceptance Criteria:
- 세션명: VOCAL, GUITAR, BASS, SYNTH, DRUM, STRINGS, WINDS
- 세션장(leader) 지정 가능
- 세션 아이콘 설정 가능

Edge Cases:
- 한 사용자가 여러 세션의 리더가 되려 할 때: ConflictError
```

---

## 4. 비기능 요구사항

### 4.1 성능

| 항목             | 요구사항         |
| ---------------- | ---------------- |
| 페이지 로드 시간 | 3초 이내         |
| API 응답 시간    | 500ms 이내 (p95) |
| 동시 사용자      | 100명 이상       |

### 4.2 보안

| 항목          | 요구사항                      |
| ------------- | ----------------------------- |
| 인증 방식     | JWT (access + refresh token)  |
| 비밀번호 저장 | bcrypt 해시 (salt rounds: 10) |
| 통신          | HTTPS 필수 (프로덕션)         |
| 토큰 저장     | HttpOnly 쿠키 권장            |

### 4.3 접근성

| 항목               | 요구사항                            |
| ------------------ | ----------------------------------- |
| 반응형             | 모바일/태블릿/데스크톱 지원         |
| 최소 지원 브라우저 | Chrome 90+, Safari 14+, Firefox 88+ |

### 4.4 유지보수성

| 항목            | 요구사항                    |
| --------------- | --------------------------- |
| 코드 품질       | ESLint + Prettier 적용      |
| 타입 안전성     | TypeScript strict 모드      |
| 테스트 커버리지 | 핵심 비즈니스 로직 80% 이상 |

---

## 5. 용어 사전 (Glossary)

### 5.1 도메인 용어

| 용어    | 영문        | 정의                                                             |
| ------- | ----------- | ---------------------------------------------------------------- |
| 기수    | Generation  | 동아리 가입 년도에 따른 구분. 예: 39기, 40기, 41기               |
| 세션    | Session     | 악기 담당 구분. VOCAL, GUITAR, BASS, SYNTH, DRUM, STRINGS, WINDS |
| 공연    | Performance | 동아리에서 개최하는 공연 행사                                    |
| 팀      | Team        | 공연에서 한 곡을 연주하는 밴드 단위                              |
| 팀 세션 | TeamSession | 팀 내에서 필요로 하는 악기 세션과 그 정원(capacity)              |
| 팀 멤버 | TeamMember  | TeamSession에 실제로 배정된 사용자                               |
| 정원    | Capacity    | TeamSession에서 모집하는 인원 수                                 |
| 포지션  | Index       | TeamSession 내에서의 순서. 1부터 capacity까지                    |
| 장비    | Equipment   | 동아리에서 관리하는 악기, 음향 장비 등                           |
| 대여    | Rental      | 장비 또는 동아리방의 예약/대여 기록                              |

### 5.2 기술 용어

| 용어           | 정의                                          |
| -------------- | --------------------------------------------- |
| JWT            | JSON Web Token. 인증에 사용되는 토큰 형식     |
| Access Token   | 짧은 만료 시간의 인증 토큰. API 요청에 사용   |
| Refresh Token  | 긴 만료 시간의 토큰. Access Token 갱신에 사용 |
| Cascade Delete | 부모 레코드 삭제 시 자식 레코드도 함께 삭제   |
| Race Condition | 동시 요청으로 인한 데이터 불일치 문제         |
| CRUD           | Create, Read, Update, Delete의 약자           |

### 5.3 세션 유형 (SessionName)

| 값      | 한글명 | 설명                     |
| ------- | ------ | ------------------------ |
| VOCAL   | 보컬   | 노래 담당                |
| GUITAR  | 기타   | 일렉 기타, 어쿠스틱 기타 |
| BASS    | 베이스 | 베이스 기타              |
| SYNTH   | 신디   | 신디사이저, 키보드       |
| DRUM    | 드럼   | 드럼, 퍼커션             |
| STRINGS | 현악기 | 바이올린, 첼로 등        |
| WINDS   | 관악기 | 색소폰, 트럼펫 등        |

### 5.4 장비 카테고리 (EquipCategory)

| 값              | 한글명            | 설명                 |
| --------------- | ----------------- | -------------------- |
| ROOM            | 동아리방          | 합주실, 연습실       |
| SYNTHESIZER     | 신디사이저        | 키보드, 신디 장비    |
| MICROPHONE      | 마이크            | 보컬/악기용 마이크   |
| GUITAR          | 기타              | 일렉/어쿠스틱 기타   |
| BASS            | 베이스            | 베이스 기타          |
| DRUM            | 드럼              | 드럼 세트, 스네어 등 |
| AUDIO_INTERFACE | 오디오 인터페이스 | 녹음용 인터페이스    |
| CABLE           | 케이블            | 각종 연결 케이블     |
| AMPLIFIER       | 앰프              | 기타/베이스 앰프     |
| SPEAKER         | 스피커            | 모니터 스피커        |
| MIXER           | 믹서              | 오디오 믹서          |
| ETC             | 기타              | 그 외 장비           |

---

## 6. 시스템 경계

### 6.1 범위 내 (In Scope)

- 회원 인증 및 권한 관리
- 공연/팀 생성 및 관리
- 팀 세션 지원/취소
- 장비/동아리방 예약
- 기수/세션 관리 (관리자)

### 6.2 범위 외 (Out of Scope)

- 결제 시스템
- 실시간 채팅/알림 (push notification)
- 공연 티켓 판매
- 외부 서비스 연동 (소셜 로그인 등)
- 파일 업로드 (이미지 업로드는 URL 입력으로 대체)

---

## 7. 제약사항

### 7.1 기술적 제약

1. **데이터베이스**: PostgreSQL 사용 (Prisma ORM)
2. **인증**: JWT 기반 (소셜 로그인 미지원)
3. **파일 저장**: 외부 URL 참조 (자체 스토리지 미구현)

### 7.2 비즈니스 제약

1. **회원가입**: 이메일 인증 없이 즉시 가입
2. **팀 지원**: 로그인한 회원만 가능
3. **관리 기능**: isAdmin 플래그 사용자만 접근

---

## 8. 참조 문서

| 문서 ID | 문서명                | 관계             |
| ------- | --------------------- | ---------------- |
| DOC-002 | 기술 스택 결정 문서   | 기술 선택 근거   |
| DOC-004 | 도메인 모델 설계서    | 상세 엔티티 정의 |
| DOC-007 | API 엔드포인트 명세서 | API 상세 스펙    |
