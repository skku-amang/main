"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"
import { useDeleteUser, useUpdateUser, useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"
import { getSessionDisplayName } from "@/constants/session"
import { publicUser } from "@repo/shared-types"
import { ApiError } from "@repo/api-client"

import { getColumns } from "./_components/columns"
import { UserFormDialog } from "./_components/UserFormDialog"

export default function UsersAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: users, isLoading } = useUsers()
  const { data: generations } = useGenerations()
  const { data: sessions } = useSessions()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<publicUser | null>(null)
  const [deleting, setDeleting] = useState<publicUser | null>(null)

  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  const generationFilters = useMemo(
    () =>
      generations
        ?.sort((a, b) => b.order - a.order)
        .map((g) => ({
          label: `${formatGenerationOrder(g.order)}기`,
          value: String(g.order)
        })) ?? [],
    [generations]
  )

  const sessionFilters = useMemo(
    () =>
      sessions?.map((s) => ({
        label: getSessionDisplayName(s.name),
        value: s.name
      })) ?? [],
    [sessions]
  )

  const handleCellUpdate = useCallback(
    async (rowId: number, columnId: string, value: unknown) => {
      const payload: Record<string, unknown> = {}
      if (columnId === "generation") {
        payload.generationId = Number(value)
      } else {
        payload[columnId] = value
      }
      try {
        await updateMutation.mutateAsync([rowId, payload])
        toast({ title: "회원 정보가 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["users"] })
      } catch (error) {
        toast({
          title: "수정에 실패했습니다.",
          description:
            error instanceof ApiError
              ? (error.detail ?? error.message)
              : (error as Error).message,
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
        onEdit: (user) => {
          setEditing(user)
          setFormOpen(true)
        },
        onDelete: (user) => {
          setDeleting(user)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleSubmit = (data: {
    name: string
    nickname: string
    bio?: string
    sessions: number[]
  }) => {
    if (!editing) return

    updateMutation
      .mutateAsync([editing.id, data])
      .then(() => {
        toast({ title: "회원 정보가 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["users"] })
        setFormOpen(false)
        setEditing(null)
      })
      .catch((error) => {
        toast({
          title: "수정에 실패했습니다.",
          description:
            error instanceof ApiError
              ? (error.detail ?? error.message)
              : (error as Error).message,
          variant: "destructive"
        })
      })
  }

  const handleDelete = () => {
    if (!deleting) return

    deleteMutation
      .mutateAsync([deleting.id])
      .then(() => {
        toast({ title: `${deleting.name} 회원이 삭제되었습니다.` })
        queryClient.invalidateQueries({ queryKey: ["users"] })
        setDeleteOpen(false)
        setDeleting(null)
      })
      .catch((error) => {
        toast({
          title: "삭제에 실패했습니다.",
          description:
            error instanceof ApiError
              ? (error.detail ?? error.message)
              : (error as Error).message,
          variant: "destructive"
        })
      })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">회원 관리</h1>

      <DataTable
        columns={columns}
        data={users ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: false }]}
        initialColumnVisibility={{ bio: false }}
        enableGlobalSearch
        searchPlaceholder="이름으로 검색..."
        onUpdateCell={handleCellUpdate}
        emptyMessage="등록된 회원이 없습니다."
        filters={[
          {
            columnId: "generation",
            label: "기수",
            options: generationFilters
          },
          {
            columnId: "sessions",
            label: "세션",
            options: sessionFilters
          }
        ]}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSubmit={handleSubmit}
        editingUser={editing}
        isPending={updateMutation.isPending}
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
            ? `${deleting.name} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
