import { Prisma, PrismaClient } from "../../generated/prisma"
import * as bcrypt from "bcrypt"
import { getRandomItem } from "./utils"

const upsertUser = (
  tx: Prisma.TransactionClient,
  data: {
    email: string
    password: string
    name: string
    nickname: string
    bio: string
    image: string
    isAdmin: boolean
    generationId: number
    sessionId: number
  }
) =>
  tx.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      password: data.password,
      name: data.name,
      nickname: data.nickname,
      bio: data.bio,
      image: data.image,
      isAdmin: data.isAdmin,
      generation: { connect: { id: data.generationId } },
      sessions: { connect: { id: data.sessionId } }
    }
  })

export const seedUsers = async (prisma: PrismaClient) => {
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD
  if (!defaultPassword) {
    console.error("SEED_DEFAULT_PASSWORD is not set.")
    return
  }

  const generations = await prisma.generation.findMany()
  const sessions = await prisma.session.findMany()

  if (generations.length === 0) {
    console.error("No Generation found. Please run generation seeds first.")
    return
  }

  if (sessions.length === 0) {
    console.error("No Session found. Please run session seeds first.")
    return
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  const adminUserData = Array.from({ length: 5 }, (_, index) => {
    const userNumber = index + 1
    const nickname = `관리자${userNumber}`
    const email = `admin${userNumber}@g.skku.edu`
    const generation = getRandomItem(generations)
    const session = getRandomItem(sessions)
    const image = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`

    return {
      email,
      password: hashedPassword,
      name: nickname,
      nickname,
      bio: `안녕하세요. 아망 ${generation.order / 2}기 ${nickname}입니다.`,
      image,
      isAdmin: true,
      generationId: generation.id,
      sessionId: session.id
    }
  })

  const generalUserData = Array.from({ length: 20 }, (_, index) => {
    const userNumber = index + 1
    const nickname = `사용자${userNumber}`
    const email = `user${userNumber}@g.skku.edu`
    const generation = getRandomItem(generations)
    const session = getRandomItem(sessions)
    const image = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email)}`

    return {
      email,
      password: hashedPassword,
      name: nickname,
      nickname,
      bio: `안녕하세요. 아망 ${generation.order / 2}기 ${nickname}입니다.`,
      image,
      isAdmin: false,
      generationId: generation.id,
      sessionId: session.id
    }
  })

  console.log("Seeding Users...")

  await prisma.$transaction(async (tx) => {
    for (const data of [...adminUserData, ...generalUserData]) {
      await upsertUser(tx, data)
    }
  })

  console.log("Seeding Users completed.")
}
