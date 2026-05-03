"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import { useGenerations } from "@/hooks/api/useGeneration"
import { useSessions } from "@/hooks/api/useSession"
import {
  useApproveUser,
  useDeleteUser,
  usePendingUsers,
  useUpdateUser
} from "@/hooks/api/useUser"
import { getSessionDisplayName } from "@/constants/session"
import { formatGenerationOrder } from "@/lib/utils"
import { ApiError } from "@repo/api-client"
import { DetailedUser } from "@repo/shared-types"

import { getColumns } from "./_components/columns"

export default function PendingUsersAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: pendingUsers, isLoading } = usePendingUsers()
  const { data: generations } = useGenerations()
  const { data: sessions } = useSessions()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<DetailedUser | null>(null)

  const approveMutation = useApproveUser()
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
      try {
        await updateMutation.mutateAsync([rowId, { [columnId]: value }])
        toast({ title: "회원 정보가 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["pendingUsers"] })
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

  const handleApprove = (user: DetailedUser) => {
    approveMutation
      .mutateAsync([user.id])
      .then(() => {
        toast({ title: `${user.name} 회원이 승인되었습니다.` })
        queryClient.invalidateQueries({ queryKey: ["pendingUsers"] })
        queryClient.invalidateQueries({ queryKey: ["users"] })
      })
      .catch((error) => {
        toast({
          title: "승인에 실패했습니다.",
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
        queryClient.invalidateQueries({ queryKey: ["pendingUsers"] })
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

  const columns = useMemo(
    () =>
      getColumns({
        onApprove: handleApprove,
        onDelete: (user) => {
          setDeleting(user)
          setDeleteOpen(true)
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div>
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold">승인 대기 회원</h1>
        {!isLoading && (
          <span className="text-muted-foreground text-sm">
            {pendingUsers?.length ?? 0}명
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={pendingUsers ?? []}
        isLoading={isLoading}
        initialSorting={[{ id: "id", desc: false }]}
        enableGlobalSearch
        searchPlaceholder="이름으로 검색..."
        onUpdateCell={handleCellUpdate}
        emptyMessage="승인 대기 중인 회원이 없습니다."
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
