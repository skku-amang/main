import { INestApplication } from "@nestjs/common"
import request from "supertest"

export interface TestTokens {
  accessToken: string
  refreshToken: string
  userId: number
}

export async function loginAsAdmin(
  app: INestApplication,
  adminIndex: number = 1
): Promise<TestTokens> {
  const res = await request(app.getHttpServer())
    .post("/auth/login")
    .send({
      email: `admin${adminIndex}@g.skku.edu`,
      password: process.env.SEED_DEFAULT_PASSWORD
    })
    .expect(200)

  const { accessToken, refreshToken, user } = res.body.data
  return { accessToken, refreshToken, userId: user.id }
}

export async function loginAsUser(
  app: INestApplication,
  userIndex: number = 1
): Promise<TestTokens> {
  const res = await request(app.getHttpServer())
    .post("/auth/login")
    .send({
      email: `user${userIndex}@g.skku.edu`,
      password: process.env.SEED_DEFAULT_PASSWORD
    })
    .expect(200)

  const { accessToken, refreshToken, user } = res.body.data
  return { accessToken, refreshToken, userId: user.id }
}

export function withAuth(req: request.Test, tokens: TestTokens): request.Test {
  return req.set("Authorization", `Bearer ${tokens.accessToken}`)
}
