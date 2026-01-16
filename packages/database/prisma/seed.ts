import { PrismaClient } from "../generated/prisma"
import {
  seedGenerations,
  seedPerformance,
  seedSessions,
  seedUsers,
  seedEquipment,
  seedTeam,
  seedEquipmentRental
} from "./seeds"
const prisma = new PrismaClient()

const main = async () => {
  console.log("Seeding started...")
  await seedSessions(prisma)
  await seedGenerations(prisma)
  await seedUsers(prisma)
  await seedPerformance(prisma)
  await seedTeam(prisma)
  await seedEquipment(prisma)
  await seedEquipmentRental(prisma)
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
