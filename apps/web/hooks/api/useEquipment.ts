import {
  mapEquipment,
  mapEquipments,
  mapEquipmentWithRentalLog
} from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"

export const useCreateEquipment = createMutationHook(
  ApiClient.prototype.createEquipment,
  mapEquipment
)

export const useEquipments = createQueryHook(
  ApiClient.prototype.getEquipments,
  (type?: "room" | "item") => ["equipments", type],
  mapEquipments
)

export const useEquipment = createQueryHook(
  ApiClient.prototype.getEquipmentById,
  (id: number) => ["equipment", id],
  mapEquipmentWithRentalLog
)

export const useUpdateEquipment = createMutationHook(
  ApiClient.prototype.updateEquipment,
  mapEquipmentWithRentalLog
)

export const useDeleteEquipment = createMutationHook(
  ApiClient.prototype.deleteEquipment
)
