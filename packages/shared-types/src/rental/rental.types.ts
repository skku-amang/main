import { Prisma, EquipmentRental } from "@repo/database"
import { publicUserSelector } from "../user/user.selector"

export type { EquipmentRental }

export const rentalLogWithUserInlcude = {
  equipment: true,
  users: {
    select: publicUserSelector
  }
} satisfies Prisma.EquipmentRentalInclude

export type RentalLogWithUsers = Prisma.EquipmentRentalGetPayload<{
  include: typeof rentalLogWithUserInlcude
}>
