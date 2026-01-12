import { PrismaClient } from "../../generated/prisma"
import * as bcrypt from "bcrypt"
import { getRandomItem } from "./utils"

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

  const adminUsers = Array.from({ length: 5 }, (_, index) => {
    const userNumber = index + 1
    const nickname = `관리자${userNumber}`
    const email = `admin${userNumber}@g.skku.edu`
    const generation = getRandomItem(generations)
    const session = getRandomItem(sessions)

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: nickname,
        nickname: nickname,
        bio: `안녕하세요. 아망 ${generation.order / 2}기 ${nickname}입니다.`,
        isAdmin: true,
        generation: {
          connect: {
            id: generation.id
          }
        },
        sessions: {
          connect: {
            id: session.id
          }
        }
      }
    })
  })

  await Promise.all(adminUsers)
  console.log("Seeding admin users completed.")

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
