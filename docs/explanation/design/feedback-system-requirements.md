# 피드백 시스템 요구사항 — 26-여름 2차 회의

> 2026-07-20 26-여름 2차 회의(개발팀 4명 + 현 간부진)에서 수집한 피드백 시스템 요구사항과 현행 점수 산정 로직(32기 파이썬 스크립트) 분석. 기능명세서(기획)와 ERD(백엔드)의 input이며, 확정 스펙이 아니라 **회의 사실 + 설계 결정 목록**이다.
>
> 도메인 용어는 [glossary.md](../../reference/glossary.md)를 따른다 (곡/녹음본/피드백/피드백 작성자/Pay-to-vote/공연 라이프사이클).

## 1. 배경 — 검증된 수요

- 현행 피드백은 **구글 폼 + 파이썬 스크립트 수동 집계**로 운영된다. 간부진 증언: "피드백만 해도 2시간 걸림".
- 백엔드 질문 "피드백·공연 팀 선정까지 아망 플랫폼 내부에서 진행하고 싶은지?"에 간부진 답변: **"웬만하면 하나의 플랫폼에서 진행하기를 원함"**.
- 결론: 피드백 시스템은 실사용자(운영진) 수요가 확인된 기능. 개발팀 로드맵에서도 최우선 (공개 회계 장부 등 다른 요청은 백로그 합의).

## 2. 간부진 요구사항

| # | 요구 | 설명 | 관련 |
|---|---|---|---|
| R1 | 피드백 점수·등수 표시 | 곡별 최종 점수와 순위를 확인 | 현행 스크립트 출력과 동일 |
| R2 | 피드백 미참여 인원 파악 | 누가 피드백을 제출하지 않았는지 목록화 | 현행: 명단 수기 대조 |
| R3 | 미참여 시 감점 적용 | 미참여 팀/개인에 페널티 | [Pay-to-vote](../../reference/glossary.md) 구체화. 현행 스크립트에 **없음** (수동 운영) |
| R4 | 피드백 단계 팀 멤버 익명 처리 | EVALUATION 진입 시 팀 구성원이 보이면 안 됨 (곡 위주 평가) | 현행 웹은 항상 노출 → 26-1 불편 사항 |
| R5 | 신입 팀 점수 별개 표시 | 신입고정팀은 일반 팀과 분리해 보여주기 | 고정곡 보장 로직과 연결 |
| R6 | 최종 선정 곡 수 설정 | 공연별 합격 곡 수(N_PASS)를 운영진이 지정 | 현행: 스크립트 상수 |
| R7 | 실제 공연 참석 세트리스트 | 합격곡 + 합격곡 참여자 명단 산출 | 현행 스크립트 부산물 |
| R8 | 공연 상태 전환 트리거 | 시간 기반(특정 시각 → 다음 상태) vs 수동 트리거 | 설계 결정 필요 (아래 D6) |

## 3. 현행 점수 산정 로직 (32기 스크립트 분석)

간부진이 보유한 파이썬 스크립트(부록 A)가 현행 채택 산정의 SSOT. 파이프라인:

1. **입력**: 구글 폼 CSV. 평가자 × 곡별 4문항 — 팀 완성도, 개인 완성도, 선호도, 피드백 코멘트(점수 계산에서 제외).
2. **참여 감지**: 세 점수가 모두 0인 곡 = 그 평가자의 참여곡 (**본인 참여곡은 0점 제출이 관례**).
3. **평가자별 표준화**: 평가자마다 본인 미참여곡 점수만으로 평균 μ·표준편차 σ를 구해 z-score 변환 `(x−μ)/σ`. 참여곡은 0. σ=0(전 곡 동일 점수)이면 전부 0 → 후하거나 짠 평가 성향 보정 + 전략적 몰아주기 무력화.
4. **곡 점수**: 곡별 z-score 합 ÷ (전체 평가자 수 − 그 곡 참여자 수).
5. **가중합**: `2×팀 완성도 + 2×개인 완성도 + 1×선호도`.
6. **선정**: 가중합 내림차순 상위 N_PASS 합격.
7. **고정곡 보장**: 합격권 밖 고정곡(신입 지정곡) 수만큼 합격 리스트 꼬리를 제거하고 고정곡 삽입.
8. **부산물**: 합격곡 참여자 명단(= 공연 참가자), 불합격곡 목록.

특성:

- **동점 실질 불가** — float 가중합이라 유효 동점 확률 ≈ 0. 회의에서 간부진도 "동점이 나올 수 없는 구조"로 확인.
- 미제출 평가자 처리 없음 — 명단에 있는 평가자는 전원 제출을 가정.

## 4. 시스템화 갭 — 설계 결정 목록

| # | 결정 항목 | 현행 | 시스템화 방향(안) |
|---|---|---|---|
| D1 | 참여 여부 판별 | "전 문항 0점" 관례로 추론 | `TeamMember` 관계로 명시. 0점 관례 제거 |
| D2 | 미제출 평가자 처리 | 전원 제출 가정 (깨지면 오산정) | 결측 정의 필요 — 분모에서 제외 vs 마감 강제 |
| D3 | 미참여 감점 (R3) | 스크립트에 없음, 수동 운영 | Pay-to-vote 규칙 신규 설계 (v0.1 팀 단위) |
| D4 | 고정곡 지정 | 스크립트 상수 `FIX_SONG` | 신입고정팀 플래그(`Team.isFreshmenFixed`)와 매핑 |
| D5 | 합격 곡 수 (R6) | 스크립트 상수 `N_PASS` | 공연(Performance) 단위 운영 설정값 |
| D6 | 상태 전환 트리거 (R8) | 수동 (스크립트 실행 시점) | 시간 기반 vs 수동 — 회의 미결. 기획 결정 필요 |
| D7 | 익명 처리 (R4) | 해당 없음 (구글 폼) | EVALUATION 진입 시 팀 멤버 비노출 정책 — 노출 범위(운영진 예외 여부) 정의 |
| D8 | 산정식 계승 여부 | z-score + 2:2:1 가중 | 검증된 로직이므로 v0.1은 그대로 계승 권장. 변경 시 간부진 합의 |

## 5. 범위 밖 (기록만)

- **연합 공연 변형**: 아망+타 동아리(모여락) 혼성 팀은 `Mean(아망 방식, 상대 동아리 방식)`으로 산정한 사례 있음. 연합 공연은 홈페이지 미사용이 기본이라 v0.1 범위 밖.
- **방학 공연**: 비활동 부원도 참여 가능 등 참여 정책이 정기공연과 다름 — [skku-amang/main#535](https://github.com/skku-amang/main/issues/535), [skku-amang/main#520](https://github.com/skku-amang/main/issues/520) 참고.

## 부록 A — 32기 점수 산정 스크립트 (원본)

> 간부진 제공 (2026-07-20). 채팅 전달 과정에서 들여쓰기가 소실되어 논리 구조에 따라 복원했다. 로직 변경 없음.

```python
import sys
import numpy as np
import pandas as pd

# 사용 방법
# - 변수를 설정해준다.
# - 시트에서 자동집계된 부분을 삭제한다.
# - 파일의 위치 경로에 한글이 포함될 경우 오류가 발생할 수 있다. 예) ~/대학/아망/
PATH = r'C:\Users\...\score250501.csv'  # 파일 경로
df = pd.read_csv(PATH, encoding='utf-8')  # 스프레드시트 불러오기
N_SONG = 31  # 전체 곡 수
N_PASS = 22  # 합격 곡 수
FIX_SONG = [1, 2, 3, 4, 5, 6, 7]  # 고정 곡 # 번호로 삽입
IG_COL = 2  # 앞에서부터 무시할 열 개수 (날짜, 이름)
N_SURVEY = 4  # 곡별 문항 수 (팀 완성도, 개인 완성도, 선호도, 피드백)

# 평가자 명단 출력
name_list = np.array((df[df['평가자 이름 '].str.len() > 0])['평가자 이름 '])  # 평가자 명단
print("# 피드백 참가자 명단: ", len(name_list), "명")
print(name_list, "\n")

# 사람당 곡별 i번째 문항 데이터를 불러온다.
# - 0: 팀 완성도
# - 1: 개인 완성도
# - 2: 선호도
def getData(index):
    data = pd.DataFrame(index=range(1, N_SONG + 1))
    for i in range(len(name_list)):
        arr = []
        for j in range(N_SONG):
            arr.append(int(df.iloc[i, IG_COL + N_SURVEY * j + index]))
        data[name_list[i]] = arr
    return data

data1 = getData(0)  # 사람당 곡별 팀 완성도
data2 = getData(1)  # 사람당 곡별 개인 완성도
data3 = getData(2)  # 사람당 곡별 선호도

# 사람당 곡별 참여 여부를 구한다.
join = pd.DataFrame(index=range(1, N_SONG + 1))  # 사람당 곡별 참여 여부
for name in name_list:
    a = []
    for song in range(1, N_SONG + 1):
        if (data1[name][song] == 0
                and data2[name][song] == 0
                and data3[name][song] == 0):  # 참여곡 (모든 점수 0점)
            a.append(1)
        else:
            a.append(0)
    join[name] = a

n_member = join.sum(axis=1)  # 곡별 참여자 수

# 곡별 점수로부터 곡별 표준화된 점수를 계산한다. 본인이 참여한 곡은 계산에서 제외된다.
def nomalization(scores, join):
    score_valid = []  # 곡별 미참여곡 점수
    result = []  # 곡별 표준화된 점수
    for i in range(1, N_SONG + 1):
        if join[i] == 0:  # 미참여곡
            score_valid.append(scores[i])
    mean = np.mean(score_valid)  # 평균
    std = np.std(score_valid)  # 표준편차
    for i in range(1, N_SONG + 1):
        if (std == 0):  # 모든 곡에 같은 점수를 주었을 때
            result.append(0)
        elif join[i] == 1:  # 참여곡
            result.append(0)
        else:  # 미참여곡
            result.append((scores[i] - mean) / std)
    return result

# 사람당 곡별 점수로부터 곡별 표준화된 점수 평균를 계산한다.
def calculate(data):
    normd = pd.DataFrame(index=range(1, N_SONG + 1))  # 사람과 곡별 표준화된 점수
    for name, scores in data.items():
        normd[name] = nomalization(scores, join[name])
    sum = normd.sum(axis=1)  # 곡별 표준화된 점수 합계
    div = [len(name_list) for i in range(N_SONG)] - n_member  # 곡별 평가자 수 (미참여자 수)
    return sum / div  # 곡별 표준화된 점수 평균

result = pd.DataFrame(index=range(1, N_SONG + 1))
result["team"] = 2 * calculate(data1)
result["indiv"] = 2 * calculate(data2)
result["prefer"] = calculate(data3)
result["sum"] = result.sum(axis=1)
print("# 피드백 결과")
print(result, end="\n\n")

result_rank = result.sort_values(by=['sum'], ascending=False)
print("# 피드백 순위")
print(result_rank, end="\n\n")

# 고정곡 보장
song_pass = result_rank[:N_PASS].index.tolist()
cnt = 0
for song in FIX_SONG:
    if song not in song_pass:
        cnt += 1
while (cnt > 0):
    song_pass.pop()
    cnt -= 1
for song in FIX_SONG:
    if song not in song_pass:
        song_pass.append(song)
print("# 합격곡")
print(song_pass, end="\n\n")

song_fail = []
for song in result_rank.index.tolist():
    if song not in song_pass:
        song_fail.append(song)
print("# 불합격곡")
print(song_fail, end="\n\n")

name_list_pass = np.array(join.drop(index=song_fail).sum(axis=0).loc[lambda x: x > 0].index)
print("# 공연 참가자 명단: ", len(name_list_pass), "명")
print(name_list_pass, end="\n\n")
```

## 참고

- 회의록: [26-여름 2차 회의](https://app.notion.com/p/26-2-3a3bbc180bd6801bbfa2df04387407d4) (Notion, 팀 내부)
- 회의발 이슈: [skku-amang/main#525](https://github.com/skku-amang/main/issues/525) (CSV 세션 명단) · [skku-amang/main#528](https://github.com/skku-amang/main/issues/528) (비밀번호 찾기) · [skku-amang/main#530](https://github.com/skku-amang/main/issues/530) (모바일 예약 UX) · [skku-amang/main#533](https://github.com/skku-amang/main/issues/533) (랜딩 배경) · [skku-amang/main#535](https://github.com/skku-amang/main/issues/535) (비활동 부원 참여 제한)
- 도메인 용어: [glossary.md](../../reference/glossary.md)
