import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestApp, closeTestApp } from "../helpers/test-app.helper"
import {
  loginAsAdmin,
  loginAsUser,
  withAuth,
  TestTokens
} from "../helpers/auth.helper"

describe("Performance Integration", () => {
  let app: INestApplication
  let adminTokens: TestTokens
  let userTokens: TestTokens
  const createdIds: number[] = []

  beforeAll(async () => {
    app = await createTestApp()
    adminTokens = await loginAsAdmin(app)
    userTokens = await loginAsUser(app)
  })

  afterAll(async () => {
    // clean up any performances we created
    for (const id of createdIds) {
      try {
        await withAuth(
          request(app.getHttpServer()).delete(`/performances/${id}`),
          adminTokens
        )
      } catch {}
    }
    await closeTestApp()
  })

  describe("GET /performances (public)", () => {
    it("should return list without auth", async () => {
      const res = await request(app.getHttpServer())
        .get("/performances")
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe("POST /performances (admin only)", () => {
    it("should create performance as admin", async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post("/performances"),
        adminTokens
      )
        .send({ name: "통합 테스트 공연" })
        .expect(201)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.name).toBe("통합 테스트 공연")
      expect(res.body.data.id).toBeDefined()
      createdIds.push(res.body.data.id)
    })

    it("should create performance with full fields", async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post("/performances"),
        adminTokens
      )
        .send({
          name: "정기 공연",
          description: "2025년 정기 공연입니다",
          location: "성균관대 새천년홀",
          startAt: "2025-12-01T18:00:00Z",
          endAt: "2025-12-01T21:00:00Z"
        })
        .expect(201)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.location).toBe("성균관대 새천년홀")
      createdIds.push(res.body.data.id)
    })

    it("should reject creation by non-admin", async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post("/performances"),
        userTokens
      )
        .send({ name: "Should Fail" })
        .expect(403)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/forbidden")
    })

    it("should reject creation without auth", async () => {
      await request(app.getHttpServer())
        .post("/performances")
        .send({ name: "No Auth" })
        .expect(401)
    })

    it("should reject empty name", async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post("/performances"),
        adminTokens
      )
        .send({ name: "" })
        .expect(400)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/validation-error")
    })
  })

  describe("GET /performances/:id (public)", () => {
    it("should return performance detail", async () => {
      const id = createdIds[0]
      const res = await request(app.getHttpServer())
        .get(`/performances/${id}`)
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.id).toBe(id)
      expect(res.body.data.name).toBe("통합 테스트 공연")
    })

    it("should return 404 for non-existent id", async () => {
      const res = await request(app.getHttpServer())
        .get("/performances/999999")
        .expect(404)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/not-found")
    })
  })

  describe("PATCH /performances/:id (admin only)", () => {
    it("should update performance as admin", async () => {
      const id = createdIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/performances/${id}`),
        adminTokens
      )
        .send({ name: "수정된 공연 이름" })
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.name).toBe("수정된 공연 이름")
    })

    it("should reject update by non-admin", async () => {
      const id = createdIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/performances/${id}`),
        userTokens
      )
        .send({ name: "Should Fail" })
        .expect(403)

      expect(res.body.isSuccess).toBe(false)
    })
  })

  describe("DELETE /performances/:id (admin only)", () => {
    it("should reject deletion by non-admin", async () => {
      const id = createdIds[0]
      await withAuth(
        request(app.getHttpServer()).delete(`/performances/${id}`),
        userTokens
      ).expect(403)
    })

    it("should delete performance as admin", async () => {
      const id = createdIds.pop()!
      const res = await withAuth(
        request(app.getHttpServer()).delete(`/performances/${id}`),
        adminTokens
      ).expect(200)

      expect(res.body.isSuccess).toBe(true)

      // verify it's gone
      await request(app.getHttpServer()).get(`/performances/${id}`).expect(404)
    })
  })
})
