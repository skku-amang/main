import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { configureApp } from "./common/configure-app"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "https://amang.json-server.win",
      "https://amang-staging.json-server.win",
      /\.vercel\.app$/
    ],
    credentials: true
  })
  configureApp(app)
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap()
