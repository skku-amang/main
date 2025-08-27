import { PrismaClient } from "../generated/prisma"
import { seedSessions, seedGenerations, seedUsers } from "./seeds"
const prisma = new PrismaClient()

const main = async () => {
  console.log("Seeding started...")
  await seedSessions(prisma)
  await seedGenerations(prisma)
  await seedUsers(prisma)
  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
