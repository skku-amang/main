import { PrismaClient } from "../../generated/prisma"
import { getDate } from "./utils"

export const seedPerformance = async (prisma: PrismaClient) => {
  const existing = await prisma.performance.count()
  if (existing > 0) {
    console.log("Performances already seeded, skipping.")
    return
  }

  console.log("Seeding performance...")
  const now = new Date()
  const year = now.getFullYear()

  const performaces = [
    {
      name: `${year - 1} 새내기 배움터 공연`,
      description: `${year - 1} 새내기 배움터 공연입니다.`,
      image: "https://picsum.photos/200/300",
      location: "MT 대강당",
      startAt: getDate(-365),
      endAt: getDate(-305, 21)
    },
    {
      name: `${year - 1} 가을 정기 공연`,
      description: `${year - 1} 가을 정기 공연입니다.`,
      image: "https://picsum.photos/200/300",
      location: "홍대 롤러코스터 라이브홀",
      startAt: getDate(-120),
      endAt: getDate(-60, 21)
    },
    {
      name: `${year} 새내기 배움터 공연`,
      description: `${year} 새내기 배움터 공연입니다.`,
      image: "https://picsum.photos/200/300",
      location: "MT 대강당",
      startAt: getDate(-30),
      endAt: getDate(30, 21)
    },
    {
      name: `${year} 1학기 정기 공연`,
      description: `${year} 1학기 정기 공연입니다.`,
      image: "https://picsum.photos/200/300",
      location: "홍대 롤러코스터 라이브홀",
      startAt: getDate(60),
      endAt: getDate(120, 21)
    },
    {
      name: `${year} 2학기 정기 공연`,
      description: `${year} 2학기 정기 공연입니다.`,
      image: "https://picsum.photos/200/300",
      location: "홍대 롤러코스터 라이브홀",
      startAt: getDate(180),
      endAt: getDate(240, 21)
    }
  ]

  await prisma.performance.createMany({
    data: performaces
  })
  console.log("Seeding performance completed.")
}
