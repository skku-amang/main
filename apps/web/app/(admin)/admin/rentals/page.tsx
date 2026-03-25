"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import {
  useCreateRental,
  useDeleteRental,
  useRentals,
  useUpdateRental
} from "@/hooks/api/useRental"
import { CreateRental, RentalDetail } from "@repo/shared-types"

import { getColumns } from "./_components/columns"
import { RentalFormDialog } from "./_components/RentalFormDialog"

export default function RentalsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: rentals, isLoading } = useRentals()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<RentalDetail | null>(null)
  const [deleting, setDeleting] = useState<RentalDetail | null>(null)

  const createMutation = useCreateRental()
  const updateMutation = useUpdateRental()
  const deleteMutation = useDeleteRental()

  const handleCellUpdate = useCallback(
    async (rowId: number, columnId: string, value: unknown) => {
      const payload: Record<string, unknown> = {}
      payload[columnId] = value
      try {
        await updateMutation.mutateAsync([rowId, payload])
        toast({ title: "예약이 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
      } catch (error) {
        toast({
          title: "수정에 실패했습니다.",
          description: (error as Error).message,
          variant: "destructive"
        })
        throw error
      }
    },
    [updateMutation, toast, queryClient]
  )

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (rental) => {
          setEditing(rental)
          setFormOpen(true)
        },
        onDelete: (rental) => {
          setDeleting(rental)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: CreateRental) => {
    const mutation = editing
      ? updateMutation.mutateAsync([editing.id, data])
      : createMutation.mutateAsync([data])

    mutation
      .then(() => {
        toast({
          title: editing ? "예약이 수정되었습니다." : "예약이 생성되었습니다."
        })
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
        setFormOpen(false)
        setEditing(null)
      })
      .catch((error) => {
        toast({
          title: "오류가 발생했습니다.",
          description: error.message,
          variant: "destructive"
        })
      })
  }

  const handleDelete = () => {
    if (!deleting) return

    deleteMutation
      .mutateAsync([deleting.id])
      .then(() => {
        toast({
          title: `${deleting.title} 예약이 삭제되었습니다.`
        })
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
        setDeleteOpen(false)
        setDeleting(null)
      })
      .catch((error) => {
        toast({
          title: "삭제에 실패했습니다.",
          description: error.message,
          variant: "destructive"
        })
      })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">예약 관리</h1>

      <DataTable
        columns={columns}
        data={rentals ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "startAt", desc: true }]}
        searchColumn="title"
        searchPlaceholder="예약 검색..."
        onCreateClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        createLabel="예약 생성"
        onUpdateCell={handleCellUpdate}
        onBulkDelete={async (rows) => {
          const results = await Promise.allSettled(
            rows.map((r) =>
              deleteMutation.mutateAsync([(r as RentalDetail).id])
            )
          )
          const failed = results.filter((r) => r.status === "rejected").length
          if (failed > 0) {
            toast({
              title: `${rows.length - failed}개 삭제, ${failed}개 실패`,
              variant: "destructive"
            })
          } else {
            toast({ title: `${rows.length}개 예약이 삭제되었습니다.` })
          }
          queryClient.invalidateQueries({ queryKey: ["rentals"] })
        }}
      />

      <RentalFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingRental={editing}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleting(null)
        }}
        onConfirm={handleDelete}
        description={
          deleting
            ? `${deleting.title} 예약을 삭제하시겠습니까?`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
