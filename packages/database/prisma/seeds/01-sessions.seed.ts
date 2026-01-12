import { PrismaClient, SessionName } from "../../generated/prisma"

export const seedSessions = async (prisma: PrismaClient) => {
  console.log("Seeding sessions...")

  for (const session of Object.values(SessionName)) {
    await prisma.session.create({
      data: {
        name: session
      }
    })
  }

  console.log("Seeding sessions completed.")
}
