import { PrismaClient } from "../../generated/prisma"

export const seedUsers = async (prisma: PrismaClient) => {
  console.log("Seeding users...")

  const generation = await prisma.generation.findFirst()
  if (!generation) {
    console.error("No generation found.")
    return
  }

  // admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@amang.com" },
    create: {
      id: "1",
      name: "관리자",
      email: "admin@amang.com",
      role: "admin"
    },
    update: {}
  })
  // create profile for admin
  await prisma.profile.upsert({
    where: { userId: admin.id },
    create: {
      userId: admin.id,
      nickname: "관리자",
      generationId: generation.id
    },
    update: {}
  })

  // regular user
  const user = await prisma.user.upsert({
    where: { email: "user@amang.com" },
    create: {
      id: "2",
      name: "사용자",
      email: "user@amang.com"
    },
    update: {}
  })
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      nickname: "사용자",
      generationId: generation.id
    },
    update: {}
  })
  console.log("Seeding users completed.")
}
