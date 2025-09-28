import { PrismaClient } from "../generated/prisma"
import {
  seedGenerations,
  seedPerformance,
  seedSessions,
  seedUsers
} from "./seeds"
const prisma = new PrismaClient()

const main = async () => {
  console.log("Seeding started...")
  await seedSessions(prisma)
  await seedGenerations(prisma)
  await seedUsers(prisma)
  await seedPerformance(prisma)
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
