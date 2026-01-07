import { Prisma, EquipmentRental } from "@repo/database"
import { publicUserSelector } from "../user/user.selector"

export type { EquipmentRental }

export const rentalLogWithUserInlcude = {
  equipment: true,
  users: {
    select: publicUserSelector
  }
} satisfies Prisma.EquipmentRentalInclude

type RentalLogWithUsers = Prisma.EquipmentRentalGetPayload<{
  include: typeof rentalLogWithUserInlcude
}>

export type RentalList = RentalLogWithUsers[]
export type RentalDetail = RentalLogWithUsers
