"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { DataTable } from "@/app/(admin)/_components/data-table/DataTable"
import { DeleteConfirmDialog } from "@/app/(admin)/_components/data-table/DeleteConfirmDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/hooks/use-toast"
import { usePerformances } from "@/hooks/api/usePerformance"
import { useAllTeams, useDeleteTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { formatGenerationOrder } from "@/lib/utils"
import { TeamList } from "@repo/shared-types"

import { getColumns } from "./_components/columns"

type TeamItem = TeamList[number]

export default function TeamsAdminPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: teams, isLoading } = useAllTeams()
  const { data: performances } = usePerformances()

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<TeamItem | null>(null)

  const deleteMutation = useDeleteTeam()
  const updateMutation = useUpdateTeam()

  const performanceMap = useMemo(
    () => new Map(performances?.map((p) => [p.id, p.name]) ?? []),
    [performances]
  )

  const performanceFilters = useMemo(
    () =>
      performances?.map((p) => ({
        label: p.name,
        value: String(p.id)
      })) ?? [],
    [performances]
  )

  const leaderFilters = useMemo(() => {
    const leaders = new Map((teams ?? []).map((t) => [t.leader.id, t.leader]))
    return [...leaders.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((leader) => ({
        label: leader.name,
        value: String(leader.id),
        render: (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={leader.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {leader.name[0]}
              </AvatarFallback>
            </Avatar>
            <span>{leader.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatGenerationOrder(leader.generation.order)}기
            </span>
          </div>
        )
      }))
  }, [teams])

  const artistFilters = useMemo(
    () =>
      [...new Set((teams ?? []).map((t) => t.songArtist))]
        .sort()
        .map((v) => ({ label: v, value: v })),
    [teams]
  )

  const columns = useMemo(
    () =>
      getColumns(
        {
          onDelete: (team) => {
            setDeleting(team)
            setDeleteOpen(true)
          }
        },
        performanceMap
      ),
    [performanceMap]
  )

  const handleCellUpdate = async (
    rowId: number,
    columnId: string,
    value: unknown
  ) => {
    const team = teams?.find((t) => t.id === rowId)
    if (!team) return

    const mapped =
      columnId === "leader"
        ? { leaderId: Number(value) }
        : { [columnId]: value }

    const payload = {
      name: team.name,
      description: team.description,
      leaderId: team.leaderId,
      songName: team.songName,
      songArtist: team.songArtist,
      isFreshmenFixed: team.isFreshmenFixed,
      isSelfMade: team.isSelfMade,
      posterImage: team.posterImage,
      songYoutubeVideoUrl: team.songYoutubeVideoUrl,
      memberSessions: team.teamSessions.map((ts) => ({
        sessionId: ts.sessionId,
        capacity: ts.capacity,
        members: ts.members.map((m) => ({
          userId: m.userId,
          index: m.index
        }))
      })),
      ...mapped
    }

    try {
      await updateMutation.mutateAsync([rowId, payload])
      toast({ title: "수정되었습니다." })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    } catch (error) {
      toast({
        title: "수정에 실패했습니다.",
        description: (error as Error).message,
        variant: "destructive"
      })
      throw error
    }
  }

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
        initialSorting={[{ id: "id", desc: true }]}
        searchColumn="songName"
        searchPlaceholder="곡명으로 검색..."
        emptyMessage="등록된 팀이 없습니다."
        onUpdateCell={handleCellUpdate}
        initialColumnVisibility={{
          name: false,
          isFreshmenFixed: false,
          isSelfMade: false
        }}
        filters={[
          {
            columnId: "performanceId",
            label: "공연",
            options: performanceFilters
          },
          {
            columnId: "leader",
            label: "팀장",
            options: leaderFilters
          },
          {
            columnId: "songArtist",
            label: "아티스트",
            options: artistFilters
          }
        ]}
        onBulkDelete={async (rows) => {
          const results = await Promise.allSettled(
            rows.map((r) => deleteMutation.mutateAsync([(r as TeamItem).id]))
          )
          const failed = results.filter((r) => r.status === "rejected").length
          if (failed > 0) {
            toast({
              title: `${rows.length - failed}개 삭제, ${failed}개 실패`,
              variant: "destructive"
            })
          } else {
            toast({ title: `${rows.length}개 팀이 삭제되었습니다.` })
          }
          queryClient.invalidateQueries({ queryKey: ["teams"] })
        }}
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
