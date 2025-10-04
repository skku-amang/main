import { PrismaClient } from "../../generated/prisma"

export const seedGenerations = async (prisma: PrismaClient) => {
  console.log("Seeding generations...")
  for (let order = 46; order <= 74; order += 1) {
    await prisma.generation.upsert({
      where: { order },
      create: { order },
      update: {}
    })
  }

  console.log("Seeding generations completed.")
}
