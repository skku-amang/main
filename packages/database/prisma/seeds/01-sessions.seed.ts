import { PrismaClient, SessionName } from "../../generated/prisma"

export const seedSessions = async (prisma: PrismaClient) => {
  console.log("Seeding sessions...")

  for (const session of Object.values(SessionName)) {
    await prisma.session.upsert({
      where: { name: session },
      update: {},
      create: { name: session }
    })
  }

  console.log("Seeding sessions completed.")
}
