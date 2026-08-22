import { NextFunction, Request, Response } from "express"
import { originCheck } from "./origin-check.middleware"

describe("originCheck", () => {
  let res: Response
  let next: NextFunction

  const makeReq = (method: string, origin?: string): Request =>
    ({ method, headers: origin ? { origin } : {} }) as Request

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    next = jest.fn()
  })

  it("GET 요청은 Origin 무관 통과", () => {
    originCheck(makeReq("GET", "https://evil.example.com"), res, next)
    expect(next).toHaveBeenCalled()
  })

  it("허용된 Origin의 POST는 통과", () => {
    originCheck(makeReq("POST", "https://amang.json-server.win"), res, next)
    expect(next).toHaveBeenCalled()
  })

  it("localhost 임의 포트는 통과", () => {
    originCheck(makeReq("POST", "http://localhost:3000"), res, next)
    expect(next).toHaveBeenCalled()
  })

  it("허용되지 않은 Origin의 POST는 403", () => {
    originCheck(makeReq("POST", "https://evil.example.com"), res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("Origin 없는 POST는 통과 (브라우저 외 클라이언트)", () => {
    originCheck(makeReq("POST"), res, next)
    expect(next).toHaveBeenCalled()
  })
})
