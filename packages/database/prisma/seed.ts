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

type SeedType = "master" | "test"

const seedMasterData = async () => {
  console.log("Seeding master data...")
  await seedSessions(prisma)
  await seedGenerations(prisma)
  console.log("Master data seeding finished.")
}

const seedTestData = async () => {
  console.log("Seeding test data...")
  await seedSessions(prisma)
  await seedGenerations(prisma)
  await seedUsers(prisma)
  await seedPerformance(prisma)
  await seedTeam(prisma)
  await seedEquipment(prisma)
  await seedEquipmentRental(prisma)
  console.log("Test data seeding finished.")
}

const main = async () => {
  const seedType = (process.env.SEED_TYPE || "test") as SeedType
  console.log(`Seeding started with type: ${seedType}`)

  if (seedType === "master") {
    await seedMasterData()
  } else {
    await seedTestData()
  }
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
