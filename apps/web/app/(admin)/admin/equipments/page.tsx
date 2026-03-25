"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import {
  useCreateEquipment,
  useDeleteEquipment,
  useEquipments,
  useUpdateEquipment
} from "@/hooks/api/useEquipment"
import { CreateEquipment, Equipment } from "@repo/shared-types"

import { getColumns } from "./_components/columns"
import { EquipmentFormDialog } from "./_components/EquipmentFormDialog"

export default function EquipmentsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: equipments, isLoading } = useEquipments()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [deleting, setDeleting] = useState<Equipment | null>(null)

  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()
  const deleteMutation = useDeleteEquipment()

  const handleCellUpdate = useCallback(
    async (rowId: number, columnId: string, value: unknown) => {
      const payload: Record<string, unknown> = {}
      payload[columnId] = value
      try {
        await updateMutation.mutateAsync([rowId, payload])
        toast({ title: "장비가 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["equipments"] })
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
        onEdit: (equipment) => {
          setEditing(equipment)
          setFormOpen(true)
        },
        onDelete: (equipment) => {
          setDeleting(equipment)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: CreateEquipment) => {
    const mutation = editing
      ? updateMutation.mutateAsync([editing.id, data])
      : createMutation.mutateAsync([data])

    mutation
      .then(() => {
        toast({
          title: editing ? "장비가 수정되었습니다." : "장비가 생성되었습니다."
        })
        queryClient.invalidateQueries({ queryKey: ["equipments"] })
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
          title: `${deleting.brand} ${deleting.model} 장비가 삭제되었습니다.`
        })
        queryClient.invalidateQueries({ queryKey: ["equipments"] })
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
      <h1 className="mb-6 text-2xl font-bold">장비 관리</h1>

      <DataTable
        columns={columns}
        data={equipments ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: true }]}
        searchColumn="model"
        searchPlaceholder="장비 검색..."
        onCreateClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        createLabel="장비 생성"
        onUpdateCell={handleCellUpdate}
        onBulkDelete={async (rows) => {
          const results = await Promise.allSettled(
            rows.map((r) => deleteMutation.mutateAsync([(r as Equipment).id]))
          )
          const failed = results.filter((r) => r.status === "rejected").length
          if (failed > 0) {
            toast({
              title: `${rows.length - failed}개 삭제, ${failed}개 실패`,
              variant: "destructive"
            })
          } else {
            toast({ title: `${rows.length}개 장비가 삭제되었습니다.` })
          }
          queryClient.invalidateQueries({ queryKey: ["equipments"] })
        }}
      />

      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingEquipment={editing}
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
            ? `${deleting.brand} ${deleting.model} 장비를 삭제하시겠습니까?`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
