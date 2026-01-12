import { PrismaClient } from "../../generated/prisma"
import * as bcrypt from "bcrypt"

export const seedUsers = async (prisma: PrismaClient) => {
  console.log("Seeding users...")

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD
  if (!defaultPassword) {
    console.error("SEED_DEFAULT_PASSWORD is not set.")
    return
  }

  const generations = await prisma.generation.findMany()
  const sessions = await prisma.session.findMany()

  if (generations.length === 0) {
    console.log("No Generation found. Please run generation seeds first.")
    return
  }

  if (sessions.length === 0) {
    console.log("No Session found. Please run session seeds first.")
    return
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  console.log("Seeding Admin Users")

  await prisma.user.upsert({
    where: {
      nickname: "관리자"
    },
    create: {
      name: "관리자",
      email: "admin@amang.com",
      password: hashedPassword,
      nickname: "관리자",
      generationId: generation.id,
      isAdmin: true
    },
    update: {}
  })

  await prisma.user.upsert({
    where: {
      nickname: "사용자"
    },
    create: {
      name: "사용자",
      email: "user@amang.com",
      password: hashedPassword,
      nickname: "사용자",
      generationId: generation.id
    },
    update: {}
  })
  console.log("Seeding users completed.")
}
