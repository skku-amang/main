import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { AppModule } from "../../../src/app.module"
import { configureApp } from "../../../src/common/configure-app"

let app: INestApplication | null = null

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile()

  app = moduleFixture.createNestApplication()
  configureApp(app)
  await app.init()
  return app
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close()
    app = null
  }
}
