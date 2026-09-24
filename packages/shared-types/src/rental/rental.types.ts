import { Prisma, EquipmentRental } from "@repo/database"
import { publicUserSelector, basicUserSelector } from "../user/user.types"

export type { EquipmentRental }

export const rentalWithUsersInclude = {
  equipment: true,
  users: {
    select: publicUserSelector
  },
  renter: {
    select: basicUserSelector
  }
} satisfies Prisma.EquipmentRentalInclude

type RentalWithUsers = Prisma.EquipmentRentalGetPayload<{
  include: typeof rentalWithUsersInclude
}>

export type RentalList = RentalWithUsers[]
export type RentalDetail = RentalWithUsers
