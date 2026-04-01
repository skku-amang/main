import { describe, expect, it } from "vitest"
import { extractYoutubeVideoId, isValidYoutubeUrl } from "./youtube"

describe("extractYoutubeVideoId", () => {
  describe("표준 youtube.com/watch URL", () => {
    it("기본 URL에서 videoId를 추출한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/watch?v=J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("플레이리스트 파라미터가 포함된 URL에서 videoId만 추출한다", () => {
      expect(
        extractYoutubeVideoId(
          "https://www.youtube.com/watch?v=J9leUoU96KU&list=RDJ9leUoU96KU&start_radio=1"
        )
      ).toBe("J9leUoU96KU")
    })

    it("타임스탬프 파라미터가 포함된 URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId(
          "https://www.youtube.com/watch?v=J9leUoU96KU&t=120"
        )
      ).toBe("J9leUoU96KU")
    })

    it("si 추적 파라미터가 포함된 URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId(
          "https://www.youtube.com/watch?v=J9leUoU96KU&si=abcdef123456"
        )
      ).toBe("J9leUoU96KU")
    })

    it("www 없는 youtube.com을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://youtube.com/watch?v=J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })
  })

  describe("youtu.be 단축 URL", () => {
    it("기본 단축 URL에서 videoId를 추출한다", () => {
      expect(extractYoutubeVideoId("https://youtu.be/J9leUoU96KU")).toBe(
        "J9leUoU96KU"
      )
    })

    it("si 파라미터가 포함된 단축 URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://youtu.be/J9leUoU96KU?si=abcdef123456")
      ).toBe("J9leUoU96KU")
    })
  })

  describe("대체 URL 형식", () => {
    it("Shorts URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/shorts/J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("Live URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/live/J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("Embed URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/embed/J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("레거시 /v/ URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/v/J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("모바일 URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://m.youtube.com/watch?v=J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })

    it("YouTube Music URL을 처리한다", () => {
      expect(
        extractYoutubeVideoId("https://music.youtube.com/watch?v=J9leUoU96KU")
      ).toBe("J9leUoU96KU")
    })
  })

  describe("잘못된 URL (null 반환)", () => {
    it("비-YouTube 도메인을 거부한다", () => {
      expect(
        extractYoutubeVideoId("https://example.com/watch?v=J9leUoU96KU")
      ).toBeNull()
    })

    it("11자를 초과하는 videoId를 거부한다", () => {
      expect(
        extractYoutubeVideoId(
          "https://www.youtube.com/watch?v=toolongvideoid123"
        )
      ).toBeNull()
    })

    it("11자 미만의 videoId를 거부한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/watch?v=abc")
      ).toBeNull()
    })

    it("v 파라미터가 없는 URL을 거부한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/watch?list=PLxxx")
      ).toBeNull()
    })

    it("빈 문자열을 거부한다", () => {
      expect(extractYoutubeVideoId("")).toBeNull()
    })

    it("URL이 아닌 문자열을 거부한다", () => {
      expect(extractYoutubeVideoId("not-a-url")).toBeNull()
    })

    it("YouTube 채널 URL을 거부한다", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/@channelname")
      ).toBeNull()
    })

    it("YouTube 플레이리스트 전용 URL을 거부한다", () => {
      expect(
        extractYoutubeVideoId(
          "https://www.youtube.com/playlist?list=PLxxxxxxxx"
        )
      ).toBeNull()
    })
  })
})

describe("isValidYoutubeUrl", () => {
  it("유효한 URL에 대해 true를 반환한다", () => {
    expect(
      isValidYoutubeUrl("https://www.youtube.com/watch?v=J9leUoU96KU")
    ).toBe(true)
  })

  it("잘못된 URL에 대해 false를 반환한다", () => {
    expect(isValidYoutubeUrl("https://example.com")).toBe(false)
  })
})
