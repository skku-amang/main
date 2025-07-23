import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { ZodValidationPipe } from "nestjs-zod"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalPipes(new ZodValidationPipe())
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>("PORT") ?? 8000)
}
bootstrap()
