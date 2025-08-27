import { PrismaClient, SessionName } from "../../generated/prisma"

export const seedSessions = async (prisma: PrismaClient) => {
  console.log("Seeding sessions...")

  for (const name of Object.values(SessionName)) {
    await prisma.session.upsert({
      where: { name },
      create: { name },
      update: {}
    })
  }

  console.log("Seeding sessions completed.")
}
