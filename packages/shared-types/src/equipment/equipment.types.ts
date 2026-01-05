import { Prisma, Equipment } from "@repo/database"

export type { Equipment }

export const equipmentWithRentalLogInclude = {
  rentalLogs: true
} satisfies Prisma.EquipmentInclude

export type EquipmentWithRentalLog = Prisma.EquipmentGetPayload<{
  include: typeof equipmentWithRentalLogInclude
}>
