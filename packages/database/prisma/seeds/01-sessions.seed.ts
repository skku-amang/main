import { BandSessionName, PrismaClient } from "../../generated/prisma"

export const seedSessions = async (prisma: PrismaClient) => {
  console.log("Seeding sessions...")

  for (const name of Object.values(BandSessionName)) {
    await prisma.bandSession.upsert({
      where: { name },
      create: { name },
      update: {}
    })
  }

  console.log("Seeding sessions completed.")
}
