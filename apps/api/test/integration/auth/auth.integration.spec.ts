import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestApp, closeTestApp } from "../helpers/test-app.helper"
import { loginAsAdmin, loginAsUser } from "../helpers/auth.helper"

describe("Auth Integration", () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await closeTestApp()
  })

  describe("POST /auth/login", () => {
    it("should login as admin with valid credentials", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin1@g.skku.edu",
          password: process.env.SEED_DEFAULT_PASSWORD
        })
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      expect(res.body.data.expiresIn).toBeDefined()
      expect(res.body.data.user).toBeDefined()
      expect(res.body.data.user.email).toBe("admin1@g.skku.edu")
      expect(res.body.data.user.isAdmin).toBe(true)
      // password should never be exposed
      expect(res.body.data.user.password).toBeUndefined()
      expect(res.body.data.user.hashedRefreshToken).toBeUndefined()
    })

    it("should login as regular user", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "user1@g.skku.edu",
          password: process.env.SEED_DEFAULT_PASSWORD
        })
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.user.isAdmin).toBe(false)
    })

    it("should reject wrong password", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin1@g.skku.edu",
          password: "WrongPassword1"
        })
        .expect(401)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/authentication-error")
    })

    it("should reject non-existent email", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nobody@g.skku.edu",
          password: "SomePassword1"
        })
        .expect(401)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/authentication-error")
    })

    it("should reject invalid email format", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "not-an-email",
          password: "SomePassword1"
        })
        .expect(400)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/validation-error")
    })

    it("should reject empty password", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin1@g.skku.edu",
          password: ""
        })
        .expect(400)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/validation-error")
    })
  })

  describe("POST /auth/logout", () => {
    it("should logout with valid token", async () => {
      const tokens = await loginAsUser(app, 1)

      const res = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${tokens.accessToken}`)
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.message).toBeDefined()
    })

    it("should reject logout without token", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/logout")
        .expect(401)

      expect(res.body.isSuccess).toBe(false)
    })
  })

  describe("POST /auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const tokens = await loginAsUser(app, 2)

      const res = await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      expect(res.body.data.expiresIn).toBeDefined()
    })

    it("should reject invalid refresh token", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: "invalid.refresh.token" })
        .expect(401)

      expect(res.body.isSuccess).toBe(false)
    })
  })
})
