import { mapRental, mapRentals } from "@/hooks/api/mapper"
import { createMutationHook, createQueryHook } from "@/hooks/useCustomQuery"
import ApiClient from "@repo/api-client"
import { GetRentalsQuery } from "@repo/shared-types"

export const useCreateRental = createMutationHook(
  ApiClient.prototype.createRental,
  mapRental
)

export const useRentals = createQueryHook(
  ApiClient.prototype.getRentals,
  (query?: GetRentalsQuery) => ["rentals", query],
  mapRentals
)

export const useRental = createQueryHook(
  ApiClient.prototype.getRentalById,
  (id: number) => ["rental", id],
  mapRental
)

export const useUpdateRental = createMutationHook(
  ApiClient.prototype.updateRental,
  mapRental
)

export const useDeleteRental = createMutationHook(
  ApiClient.prototype.deleteRental
)
