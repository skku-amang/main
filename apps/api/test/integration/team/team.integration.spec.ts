import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { createTestApp, closeTestApp } from "../helpers/test-app.helper"
import {
  loginAsAdmin,
  loginAsUser,
  withAuth,
  TestTokens
} from "../helpers/auth.helper"

describe("Team Integration", () => {
  let app: INestApplication
  let adminTokens: TestTokens
  let user1Tokens: TestTokens
  let user2Tokens: TestTokens
  let performanceId: number
  let sessionId: number
  const createdTeamIds: number[] = []

  beforeAll(async () => {
    app = await createTestApp()
    adminTokens = await loginAsAdmin(app)
    user1Tokens = await loginAsUser(app, 1)
    user2Tokens = await loginAsUser(app, 2)

    // create a performance for team tests
    const perfRes = await withAuth(
      request(app.getHttpServer()).post("/performances"),
      adminTokens
    )
      .send({ name: "팀 테스트용 공연" })
      .expect(201)
    performanceId = perfRes.body.data.id

    // get a session ID from seeded data
    const sessionRes = await request(app.getHttpServer())
      .get("/sessions")
      .expect(200)
    sessionId = sessionRes.body.data[0].id
  })

  afterAll(async () => {
    // clean up teams
    for (const id of createdTeamIds) {
      try {
        await withAuth(
          request(app.getHttpServer()).delete(`/teams/${id}`),
          adminTokens
        )
      } catch {}
    }
    // clean up performance
    try {
      await withAuth(
        request(app.getHttpServer()).delete(`/performances/${performanceId}`),
        adminTokens
      )
    } catch {}

    await closeTestApp()
  })

  describe("GET /teams (public)", () => {
    it("should return list without auth", async () => {
      const res = await request(app.getHttpServer()).get("/teams").expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  describe("POST /teams (authenticated)", () => {
    it("should create team with sessions", async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post("/teams"),
        adminTokens
      )
        .send({
          name: "통합 테스트 밴드",
          songName: "Test Song",
          songArtist: "Test Artist",
          leaderId: adminTokens.userId,
          performanceId,
          memberSessions: [
            {
              sessionId,
              capacity: 2,
              members: []
            }
          ]
        })
        .expect(201)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.name).toBe("통합 테스트 밴드")
      expect(res.body.data.teamSessions).toBeDefined()
      expect(res.body.data.teamSessions.length).toBe(1)
      createdTeamIds.push(res.body.data.id)
    })

    it("should reject creation without auth", async () => {
      await request(app.getHttpServer())
        .post("/teams")
        .send({
          name: "No Auth",
          songName: "Song",
          songArtist: "Artist",
          leaderId: 1,
          performanceId,
          memberSessions: []
        })
        .expect(401)
    })
  })

  describe("GET /teams/:id (public)", () => {
    it("should return team detail", async () => {
      const id = createdTeamIds[0]
      const res = await request(app.getHttpServer())
        .get(`/teams/${id}`)
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.id).toBe(id)
      expect(res.body.data.teamSessions).toBeDefined()
      expect(res.body.data.leader).toBeDefined()
    })

    it("should return 404 for non-existent team", async () => {
      const res = await request(app.getHttpServer())
        .get("/teams/999999")
        .expect(404)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/not-found")
    })
  })

  describe("PUT /teams/:id (owner or admin)", () => {
    it("should update team as owner", async () => {
      const id = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).put(`/teams/${id}`),
        adminTokens
      )
        .send({
          name: "수정된 밴드",
          songName: "Updated Song",
          songArtist: "Updated Artist",
          leaderId: adminTokens.userId,
          memberSessions: [
            {
              sessionId,
              capacity: 3,
              members: []
            }
          ]
        })
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      expect(res.body.data.name).toBe("수정된 밴드")
    })

    it("should reject update by non-owner non-admin", async () => {
      const id = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).put(`/teams/${id}`),
        user1Tokens
      )
        .send({
          name: "Should Fail",
          songName: "Song",
          songArtist: "Artist",
          leaderId: user1Tokens.userId,
          memberSessions: []
        })
        .expect(403)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/forbidden")
    })
  })

  describe("PATCH /teams/:id/apply (authenticated)", () => {
    it("should apply to a team session", async () => {
      const teamId = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/apply`),
        user1Tokens
      )
        .send([{ sessionId, index: 1 }])
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      // verify member was added
      const teamSession = res.body.data.teamSessions.find(
        (ts: any) => ts.session.id === sessionId
      )
      expect(teamSession.members.length).toBe(1)
      expect(teamSession.members[0].user.id).toBe(user1Tokens.userId)
    })

    it("should reject duplicate application", async () => {
      const teamId = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/apply`),
        user1Tokens
      )
        .send([{ sessionId, index: 2 }])
        .expect(409)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/team/duplicate-application")
    })

    it("should reject occupied position", async () => {
      const teamId = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/apply`),
        user2Tokens
      )
        .send([{ sessionId, index: 1 }])
        .expect(409)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/team/position-occupied")
    })

    it("should allow second user in different position", async () => {
      const teamId = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/apply`),
        user2Tokens
      )
        .send([{ sessionId, index: 2 }])
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      const teamSession = res.body.data.teamSessions.find(
        (ts: any) => ts.session.id === sessionId
      )
      expect(teamSession.members.length).toBe(2)
    })
  })

  describe("PATCH /teams/:id/unapply (authenticated)", () => {
    it("should reject unapply for another user's position", async () => {
      const teamId = createdTeamIds[0]
      // user2 tries to unapply from index 1 (user1's position)
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/unapply`),
        user2Tokens
      )
        .send([{ sessionId, index: 1 }])
        .expect(403)

      expect(res.body.isSuccess).toBe(false)
      expect(res.body.error.type).toBe("/errors/forbidden")
    })

    it("should unapply from team session", async () => {
      const teamId = createdTeamIds[0]
      const res = await withAuth(
        request(app.getHttpServer()).patch(`/teams/${teamId}/unapply`),
        user1Tokens
      )
        .send([{ sessionId, index: 1 }])
        .expect(200)

      expect(res.body.isSuccess).toBe(true)
      const teamSession = res.body.data.teamSessions.find(
        (ts: any) => ts.session.id === sessionId
      )
      // user1 removed, only user2 remains
      expect(teamSession.members.length).toBe(1)
    })
  })

  describe("DELETE /teams/:id (owner or admin)", () => {
    it("should reject deletion by non-owner", async () => {
      const id = createdTeamIds[0]
      await withAuth(
        request(app.getHttpServer()).delete(`/teams/${id}`),
        user1Tokens
      ).expect(403)
    })

    it("should delete team as admin", async () => {
      const id = createdTeamIds.pop()!
      const res = await withAuth(
        request(app.getHttpServer()).delete(`/teams/${id}`),
        adminTokens
      ).expect(200)

      expect(res.body.isSuccess).toBe(true)

      // verify it's gone
      await request(app.getHttpServer()).get(`/teams/${id}`).expect(404)
    })
  })
})
