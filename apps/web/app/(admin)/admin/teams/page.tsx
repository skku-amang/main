"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { useToast } from "@/components/hooks/use-toast"
import { useAllTeams, useDeleteTeam } from "@/hooks/api/useTeam"
import { TeamList } from "@repo/shared-types"

import { getColumns } from "./_components/columns"

type TeamItem = TeamList[number]

export default function TeamsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: teams, isLoading } = useAllTeams()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<TeamItem | null>(null)

  const deleteMutation = useDeleteTeam()

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (team) => {
          setDeleting(team)
          setDeleteOpen(true)
        }
      }),
    []
  )

  const handleDelete = () => {
    if (!deleting) return

    deleteMutation
      .mutateAsync([deleting.id])
      .then(() => {
        toast({ title: `${deleting.songName} 팀이 삭제되었습니다.` })
        queryClient.invalidateQueries({ queryKey: ["teams"] })
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
      <h1 className="mb-6 text-2xl font-bold">팀 관리</h1>

      <DataTable
        columns={columns}
        data={teams ?? []}
        isLoading={isLoading}
        searchColumn="songName"
        searchPlaceholder="곡명으로 검색..."
        emptyMessage="등록된 팀이 없습니다."
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleting(null)
        }}
        onConfirm={handleDelete}
        description={
          deleting ? `"${deleting.songName}" 팀을 삭제하시겠습니까?` : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
