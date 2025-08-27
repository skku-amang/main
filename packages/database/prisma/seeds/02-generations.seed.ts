import { PrismaClient } from "../../generated/prisma"

export const seedGenerations = async (prisma: PrismaClient) => {
  console.log("Seeding generations...")
  for (let order = 23.0; order <= 37; order += 0.5) {
    await prisma.generation.upsert({
      where: { order },
      create: { order },
      update: {}
    })
  }

  console.log("Seeding generations completed.")
}
