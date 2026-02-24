"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import { getSessionDisplayName } from "@/constants/session"
import {
  useCreateSession,
  useDeleteSession,
  useSessions,
  useUpdateSession
} from "@/hooks/api/useSession"
import { CreateSession, SessionWithBasicUsers } from "@repo/shared-types"

import { getColumns } from "./_components/columns"
import { SessionFormDialog } from "./_components/SessionFormDialog"

export default function SessionsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: sessions, isLoading } = useSessions()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<SessionWithBasicUsers | null>(null)
  const [deleting, setDeleting] = useState<SessionWithBasicUsers | null>(null)

  const createMutation = useCreateSession()
  const updateMutation = useUpdateSession()
  const deleteMutation = useDeleteSession()

  const handleCellUpdate = useCallback(
    async (rowId: number, columnId: string, value: unknown) => {
      const payload: Record<string, unknown> = {}
      if (columnId === "leader") {
        payload.leaderId = value === "none" ? null : Number(value)
      } else {
        payload[columnId] = value
      }
      try {
        await updateMutation.mutateAsync([rowId, payload])
        toast({ title: "세션이 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["sessions"] })
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
        onEdit: (session) => {
          setEditing(session)
          setFormOpen(true)
        },
        onDelete: (session) => {
          setDeleting(session)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: CreateSession) => {
    const mutation = editing
      ? updateMutation.mutateAsync([editing.id, data])
      : createMutation.mutateAsync([data])

    mutation
      .then(() => {
        toast({
          title: editing ? "세션이 수정되었습니다." : "세션이 생성되었습니다."
        })
        queryClient.invalidateQueries({ queryKey: ["sessions"] })
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
          title: `${getSessionDisplayName(deleting.name)} 세션이 삭제되었습니다.`
        })
        queryClient.invalidateQueries({ queryKey: ["sessions"] })
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
      <h1 className="mb-6 text-2xl font-bold">세션 관리</h1>

      <DataTable
        columns={columns}
        data={sessions ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: false }]}
        searchColumn="name"
        searchPlaceholder="세션 검색..."
        onCreateClick={() => {
          setEditing(null)
          setFormOpen(true)
        }}
        createLabel="세션 생성"
        onUpdateCell={handleCellUpdate}
        onBulkDelete={async (rows) => {
          const results = await Promise.allSettled(
            rows.map((r) =>
              deleteMutation.mutateAsync([(r as SessionWithBasicUsers).id])
            )
          )
          const failed = results.filter((r) => r.status === "rejected").length
          if (failed > 0) {
            toast({
              title: `${rows.length - failed}개 삭제, ${failed}개 실패`,
              variant: "destructive"
            })
          } else {
            toast({ title: `${rows.length}개 세션이 삭제되었습니다.` })
          }
          queryClient.invalidateQueries({ queryKey: ["sessions"] })
        }}
      />

      <SessionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingSession={editing}
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
            ? `${getSessionDisplayName(deleting.name)} 세션을 삭제하시겠습니까?`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
