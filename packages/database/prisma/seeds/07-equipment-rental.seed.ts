import { PrismaClient, Equipment, User } from "../../generated/prisma"
import { EquipCategory } from "../../generated/prisma"
import {
  getRandomBoolean,
  getRandomInt,
  getRandomItem,
  getRandomItems
} from "./utils"

const generateSequentialRentals = async (
  prisma: PrismaClient,
  equipment: Equipment,
  users: User[],
  startDate: Date,
  endDate: Date,
  isRoom: boolean
) => {
  let currentTime = new Date(startDate)
  const minutes = [0, 15, 30, 45]

  const rentalOperation = []

  while (currentTime < endDate) {
    const breakHours = getRandomInt(0, 2)

    const startAt = new Date(
      currentTime.getTime() + breakHours * 60 * 60 * 1000
    )
    startAt.setMinutes(startAt.getMinutes() + getRandomItem([0, 15, 30]))

    if (startAt >= endDate) break

    let durationHours: number
    if (isRoom) {
      durationHours = getRandomInt(1, 6)
    } else {
      durationHours = getRandomBoolean(0.6)
        ? getRandomInt(24, 24 * 5)
        : getRandomInt(6, 12)
    }

    const endAt = new Date(startAt.getTime() + durationHours * 60 * 60 * 1000)
    endAt.setMinutes(getRandomItem(minutes))
    if (endAt >= endDate) break

    const rentalUsers = getRandomItems(users, 3)
    let title: string
    if (isRoom) {
      const activities = ["합주", "정기 회의", "청소", "개인연습"]
      title = `${getRandomItem(activities)} - 테스트 대여`
    } else {
      const purposes = [
        "공연 사용",
        "개인 합주",
        "녹음",
        "외부 행사",
        "집 연습"
      ]
      title = `${getRandomItem(purposes)} - 테스트 대여`
    }

    rentalOperation.push(
      prisma.equipmentRental.create({
        data: {
          title,
          startAt,
          endAt,
          equipment: {
            connect: { id: equipment.id }
          },
          users: {
            connect: rentalUsers.map((user) => ({ id: user.id }))
          }
        }
      })
    )

    currentTime = new Date(endAt)
  }

  if (rentalOperation.length > 0) await prisma.$transaction(rentalOperation)
}

export const seedEquipmentRental = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany({ where: { isAdmin: false } })
  if (users.length === 0) {
    console.error("No users found. Skipping rental seeding.")
    return
  }

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 1)

  const room = await prisma.equipment.findFirst({
    where: {
      category: EquipCategory.ROOM
    }
  })

  if (room) {
    console.log("Seeding Amang Room Rental...")
    await generateSequentialRentals(
      prisma,
      room,
      users,
      startDate,
      endDate,
      true
    )

    console.log("Seeding Amang Room completed.")
  }

  const equipments = await prisma.equipment.findMany({
    where: {
      category: EquipCategory.MICROPHONE
    }
  })

  if (equipments) {
    console.log("Seeding Equipment Rental Rental...")
    await Promise.all(
      equipments.map((equipment) =>
        generateSequentialRentals(
          prisma,
          equipment,
          users,
          startDate,
          endDate,
          false
        )
      )
    )

    console.log("Seeding Equipment Rental completed.")
  }
}
