"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import {
  useCreateGeneration,
  useDeleteGeneration,
  useGenerations,
  useUpdateGeneration
} from "@/hooks/api/useGeneration"
import { formatGenerationOrder } from "@/lib/utils"
import { GenerationWithBasicUsers } from "@repo/shared-types"

import { getColumns } from "./_components/columns"
import { GenerationFormDialog } from "./_components/GenerationFormDialog"

export default function GenerationsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: generations, isLoading } = useGenerations()

  // 다이얼로그 상태
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<GenerationWithBasicUsers | null>(null)
  const [deleting, setDeleting] = useState<GenerationWithBasicUsers | null>(
    null
  )

  const createMutation = useCreateGeneration()
  const updateMutation = useUpdateGeneration()
  const deleteMutation = useDeleteGeneration()

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (gen) => {
          setEditing(gen)
          setFormOpen(true)
        },
        onDelete: (gen) => {
          setDeleting(gen)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: { order: number; leaderId?: number }) => {
    const mutation = editing
      ? updateMutation.mutateAsync([editing.id, data])
      : createMutation.mutateAsync([data])

    mutation
      .then(() => {
        toast({
          title: editing ? "기수가 수정되었습니다." : "기수가 생성되었습니다."
        })
        queryClient.invalidateQueries({ queryKey: ["generations"] })
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
          title: `${formatGenerationOrder(deleting.order)}기가 삭제되었습니다.`
        })
        queryClient.invalidateQueries({ queryKey: ["generations"] })
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
      <h1 className="mb-6 text-2xl font-bold">기수 관리</h1>

      <DataTable
        columns={columns}
        data={generations ?? []}
        initialSorting={[{ id: "order", desc: true }]}
        isLoading={isLoading}
        onCreateClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        createLabel="기수 생성"
      />

      <GenerationFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingGeneration={editing}
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
            ? `${formatGenerationOrder(deleting.order)}기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
