"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import {
  useCreatePerformance,
  useDeletePerformance,
  usePerformances,
  useUpdatePerformance
} from "@/hooks/api/usePerformance"
import { Performance } from "@repo/shared-types"

import { getColumns } from "./_components/columns"
import { PerformanceFormDialog } from "./_components/PerformanceFormDialog"

export default function PerformancesAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: performances, isLoading } = usePerformances()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Performance | null>(null)
  const [deleting, setDeleting] = useState<Performance | null>(null)

  const createMutation = useCreatePerformance()
  const updateMutation = useUpdatePerformance()
  const deleteMutation = useDeletePerformance()

  const handleCellUpdate = useCallback(
    async (rowId: number, columnId: string, value: unknown) => {
      const payload: Record<string, unknown> = {}
      if (columnId === "startAt" || columnId === "endAt") {
        payload[columnId] = value ? new Date(value as string) : null
      } else {
        payload[columnId] = value
      }
      try {
        await updateMutation.mutateAsync([rowId, payload])
        toast({ title: "수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["performances"] })
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

  const locationFilters = useMemo(() => {
    const locations = new Set(
      performances?.map((p) => p.location).filter(Boolean) as string[]
    )
    return [...locations].sort().map((loc) => ({ label: loc, value: loc }))
  }, [performances])

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (perf) => {
          setEditing(perf)
          setFormOpen(true)
        },
        onDelete: (perf) => {
          setDeleting(perf)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: {
    name: string
    description?: string | null
    location?: string | null
    startAt?: string | null
    endAt?: string | null
  }) => {
    // datetime-local string을 Date로 변환
    const payload = {
      name: data.name,
      description: data.description,
      location: data.location,
      startAt: data.startAt ? new Date(data.startAt) : null,
      endAt: data.endAt ? new Date(data.endAt) : null
    }

    const mutation = editing
      ? updateMutation.mutateAsync([editing.id, payload])
      : createMutation.mutateAsync([payload])

    mutation
      .then(() => {
        toast({
          title: editing ? "공연이 수정되었습니다." : "공연이 생성되었습니다."
        })
        queryClient.invalidateQueries({ queryKey: ["performances"] })
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
        toast({ title: `${deleting.name} 공연이 삭제되었습니다.` })
        queryClient.invalidateQueries({ queryKey: ["performances"] })
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
      <h1 className="mb-6 text-2xl font-bold">공연 관리</h1>

      <DataTable
        columns={columns}
        data={performances ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: true }]}
        initialColumnVisibility={{ description: false, posterImage: false }}
        searchColumn="name"
        searchPlaceholder="공연 검색..."
        onCreateClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        createLabel="공연 생성"
        filters={[
          {
            columnId: "location",
            label: "장소",
            options: locationFilters
          }
        ]}
        onUpdateCell={handleCellUpdate}
        onBulkDelete={async (rows) => {
          const results = await Promise.allSettled(
            rows.map((r) => deleteMutation.mutateAsync([(r as Performance).id]))
          )
          const failed = results.filter((r) => r.status === "rejected").length
          if (failed > 0) {
            toast({
              title: `${rows.length - failed}개 삭제, ${failed}개 실패`,
              variant: "destructive"
            })
          } else {
            toast({ title: `${rows.length}개 공연이 삭제되었습니다.` })
          }
          queryClient.invalidateQueries({ queryKey: ["performances"] })
        }}
      />

      <PerformanceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingPerformance={editing}
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
            ? `${deleting.name} 공연을 삭제하시겠습니까? 소속 팀도 모두 삭제됩니다.`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
