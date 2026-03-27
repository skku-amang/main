import { Prisma, EquipmentRental } from "@repo/database"
import { publicUserSelector, basicUserSelector } from "../user/user.types"

export type { EquipmentRental }

export const rentalLogWithUserInlcude = {
  equipment: true,
  users: {
    select: publicUserSelector
  },
  renter: {
    select: basicUserSelector
  }
} satisfies Prisma.EquipmentRentalInclude

type RentalLogWithUsers = Prisma.EquipmentRentalGetPayload<{
  include: typeof rentalLogWithUserInlcude
}>

export type RentalList = RentalLogWithUsers[]
export type RentalDetail = RentalLogWithUsers
