import { describe, expect, it } from "vitest"
import { MAX_RECORDING_SIZE } from "../constants/file-validation"
import { UpdateTeamRecordingSchema } from "../team/update-team-recording.schema"
import { UpdateTeamSchema } from "../team/update-team.schema"
import { RecordingPresignedUrlRequestSchema } from "./presigned-url.schema"

describe("RecordingPresignedUrlRequestSchema", () => {
  const ok = {
    filename: "song.mp3",
    contentType: "audio/mpeg",
    size: 10 * 1024 * 1024
  }

  it("음원 10MB는 통과", () => {
    expect(RecordingPresignedUrlRequestSchema.safeParse(ok).success).toBe(true)
  })

  it.each(["audio/x-m4a", "audio/mp4", "audio/wav", "audio/x-wav"])(
    "%s 통과",
    (contentType) => {
      expect(
        RecordingPresignedUrlRequestSchema.safeParse({ ...ok, contentType })
          .success
      ).toBe(true)
    }
  )

  it("영상은 거부", () => {
    expect(
      RecordingPresignedUrlRequestSchema.safeParse({
        ...ok,
        contentType: "video/mp4"
      }).success
    ).toBe(false)
  })

  it("50MB 초과는 거부, 문구", () => {
    const r = RecordingPresignedUrlRequestSchema.safeParse({
      ...ok,
      size: MAX_RECORDING_SIZE + 1
    })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.message).toBe("녹음본은 50MB 이하여야 합니다.")
  })

  it("정확히 50MB는 통과", () => {
    expect(
      RecordingPresignedUrlRequestSchema.safeParse({
        ...ok,
        size: MAX_RECORDING_SIZE
      }).success
    ).toBe(true)
  })
})

describe("UpdateTeamRecordingSchema", () => {
  it("null은 삭제로 통과", () => {
    expect(
      UpdateTeamRecordingSchema.safeParse({ recordingUrl: null }).success
    ).toBe(true)
  })

  it("URL 아닌 문자열 거부", () => {
    expect(
      UpdateTeamRecordingSchema.safeParse({ recordingUrl: "abc" }).success
    ).toBe(false)
  })
})

describe("UpdateTeamSchema", () => {
  it("recordingUrl은 모르는 키로 버린다 (팀 수정이 녹음본을 건드리지 않게)", () => {
    const parsed = UpdateTeamSchema.parse({
      name: "팀",
      leaderId: 1,
      songName: "곡",
      songArtist: "가수",
      memberSessions: [],
      recordingUrl: "https://s3.test/amang/recordings/a.mp3"
    })
    expect("recordingUrl" in parsed).toBe(false)
  })
})
