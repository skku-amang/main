import { ConfigService } from "@nestjs/config"
import { ObjectStorageService } from "./object-storage.service"

describe("ObjectStorageService.ownObjectKey", () => {
  const values: Record<string, string> = {
    S3_ENDPOINT: "http://localhost:9000",
    S3_BUCKET: "amang",
    S3_ACCESS_KEY: "a",
    S3_SECRET_KEY: "b"
  }
  const config = {
    get: (key: string, fallback?: string) => values[key] ?? fallback,
    getOrThrow: (key: string) => values[key]
  } as unknown as ConfigService
  const storage = new ObjectStorageService(config)
  const base = "http://localhost:9000/amang/"
  const uuid = "a70e315b-d6c3-4e8c-8610-9f89f8f734a5"

  it("이 저장소의 정규 주소면 객체 키를 돌려준다", () => {
    expect(storage.ownObjectKey(`${base}recordings/${uuid}.wav`)).toBe(
      `recordings/${uuid}.wav`
    )
  })

  it.each([
    ["경로 조작 ..", `${base}recordings/../images/x.png`],
    ["인코딩된 ..", `${base}recordings/%2e%2e/images/x.png`],
    ["쿼리", `${base}recordings/${uuid}.wav?x=1`],
    ["해시", `${base}recordings/${uuid}.wav#a`],
    ["다른 호스트", `https://evil.example/amang/recordings/${uuid}.wav`],
    ["다른 버킷", `http://localhost:9000/other/recordings/${uuid}.wav`],
    ["주소 아님", "recordings/x.wav"]
  ])("%s → null", (_, url) => {
    expect(storage.ownObjectKey(url)).toBeNull()
  })
})
