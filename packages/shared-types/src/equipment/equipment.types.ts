import { Prisma, Equipment } from "@repo/database"

export type { Equipment }

export const equipmentWithRentalLogInclude = {
  rentalLogs: true
} satisfies Prisma.EquipmentInclude

type EquipmentWithRentalLog = Prisma.EquipmentGetPayload<{
  include: typeof equipmentWithRentalLogInclude
}>

export type RentalList = EquipmentWithRentalLog[]
export type RentalDetail = EquipmentWithRentalLog
