import { PrismaClient } from "../../generated/prisma"

export const seedPerformance = async (prisma: PrismaClient) => {
  console.log("Seeding performance...")

  await prisma.performance.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "샘플 공연",
      description: "샘플 공연 설명입니다.",
      posterImage: "https://picsum.photos/200/300",
      location: "동방",
      startAt: new Date("2025-09-28T18:00:00Z"),
      endAt: new Date("2025-09-28T21:00:00Z")
    }
  })

  console.log("Seeding performance completed.")
}
