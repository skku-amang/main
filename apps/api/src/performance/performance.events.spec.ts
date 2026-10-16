import { changedPerformanceFields } from "./performance.events"

describe("changedPerformanceFields", () => {
  const existing = {
    name: "봄 공연",
    location: "소극장",
    startAt: new Date("2026-11-01T10:00:00Z"),
    endAt: new Date("2026-11-01T12:00:00Z")
  }

  it("아무것도 안 보내면 빈 배열", () => {
    expect(changedPerformanceFields(existing, {})).toEqual([])
  })

  it("같은 날짜를 다른 Date 인스턴스로 보내도 변경이 아니다", () => {
    expect(
      changedPerformanceFields(existing, {
        startAt: new Date("2026-11-01T10:00:00Z")
      })
    ).toEqual([])
  })

  it("일정·장소·이름 변경을 필드 순서대로 돌려준다", () => {
    expect(
      changedPerformanceFields(existing, {
        location: "대강당",
        startAt: new Date("2026-11-02T10:00:00Z"),
        name: "가을 공연"
      })
    ).toEqual(["name", "startAt", "location"])
  })

  it("설명·이미지 변경은 알림 대상이 아니다", () => {
    expect(
      changedPerformanceFields(existing, {
        description: "새 설명",
        image: "https://x/y.png"
      })
    ).toEqual([])
  })

  it("null이던 장소에 값이 생기면 변경이다", () => {
    expect(
      changedPerformanceFields(
        { ...existing, location: null },
        { location: "A" }
      )
    ).toEqual(["location"])
  })
})
