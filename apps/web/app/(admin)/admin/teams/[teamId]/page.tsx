"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ExternalLink, Save } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useUnsavedChanges } from "@/app/(admin)/_components/UnsavedChangesContext"
import { UserSelectContent } from "@/app/(admin)/_components/UserSelectContent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/hooks/use-toast"
import ROUTES from "@/constants/routes"
import { useTeam, useUpdateTeam } from "@/hooks/api/useTeam"
import { useUsers } from "@/hooks/api/useUser"
import { TeamDetail, UpdateTeam } from "@repo/shared-types"

import { TeamSessionsEditor } from "./_components/TeamSessionsEditor"

type MemberSessionState = {
  sessionId: number
  capacity: number
  members: { userId: number; index: number }[]
}

export default function TeamDetailAdminPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const id = parseInt(teamId)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { guardNavigation, setDirty } = useUnsavedChanges()

  const { data: team, isLoading } = useTeam(id)
  const { data: users } = useUsers()
  const updateMutation = useUpdateTeam()

  // 폼 상태
  const [name, setName] = useState("")
  const [songName, setSongName] = useState("")
  const [songArtist, setSongArtist] = useState("")
  const [leaderId, setLeaderId] = useState<number>(0)
  const [isFreshmenFixed, setIsFreshmenFixed] = useState(false)
  const [isSelfMade, setIsSelfMade] = useState(false)
  const [songYoutubeVideoUrl, setSongYoutubeVideoUrl] = useState("")
  const [memberSessions, setMemberSessions] = useState<MemberSessionState[]>([])

  // 팀 데이터 로드 시 폼에 반영
  useEffect(() => {
    if (team) {
      setName(team.name)
      setSongName(team.songName)
      setSongArtist(team.songArtist)
      setLeaderId(team.leaderId)
      setIsFreshmenFixed(team.isFreshmenFixed)
      setIsSelfMade(team.isSelfMade)
      setSongYoutubeVideoUrl(team.songYoutubeVideoUrl ?? "")
      setMemberSessions(
        team.teamSessions.map((ts) => ({
          sessionId: ts.sessionId,
          capacity: ts.capacity,
          members: ts.members.map((m) => ({
            userId: m.userId,
            index: m.index
          }))
        }))
      )
    }
  }, [team])

  // 변경사항 감지
  const isDirty = useMemo(() => {
    if (!team) return false
    if (name !== team.name) return true
    if (songName !== team.songName) return true
    if (songArtist !== team.songArtist) return true
    if (leaderId !== team.leaderId) return true
    if (isFreshmenFixed !== team.isFreshmenFixed) return true
    if (isSelfMade !== team.isSelfMade) return true
    if ((songYoutubeVideoUrl || "") !== (team.songYoutubeVideoUrl ?? ""))
      return true
    const original = team.teamSessions.map((ts) => ({
      sessionId: ts.sessionId,
      capacity: ts.capacity,
      members: ts.members.map((m) => ({ userId: m.userId, index: m.index }))
    }))
    return JSON.stringify(memberSessions) !== JSON.stringify(original)
  }, [
    team,
    name,
    songName,
    songArtist,
    leaderId,
    isFreshmenFixed,
    isSelfMade,
    songYoutubeVideoUrl,
    memberSessions
  ])

  // 변경사항을 context에 동기화 + 브라우저 닫기/새로고침 방지
  useEffect(() => {
    setDirty(isDirty)
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty, setDirty])

  // 언마운트 시 dirty 초기화
  useEffect(() => {
    return () => setDirty(false)
  }, [setDirty])

  const handleSave = useCallback(() => {
    const payload: UpdateTeam = {
      name,
      songName,
      songArtist,
      leaderId,
      isFreshmenFixed,
      isSelfMade,
      songYoutubeVideoUrl: songYoutubeVideoUrl || undefined,
      memberSessions
    }

    updateMutation
      .mutateAsync([id, payload])
      .then(() => {
        toast({ title: "팀이 수정되었습니다." })
        queryClient.invalidateQueries({ queryKey: ["team", id] })
        queryClient.invalidateQueries({ queryKey: ["teams"] })
      })
      .catch((error) => {
        toast({
          title: "수정에 실패했습니다.",
          description: error.message,
          variant: "destructive"
        })
      })
  }, [
    id,
    name,
    songName,
    songArtist,
    leaderId,
    isFreshmenFixed,
    isSelfMade,
    songYoutubeVideoUrl,
    memberSessions,
    updateMutation,
    queryClient,
    toast
  ])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!team) {
    return <div className="text-neutral-500">팀을 찾을 수 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.ADMIN.TEAMS}
            onClick={(e) => {
              if (guardNavigation(ROUTES.ADMIN.TEAMS)) e.preventDefault()
            }}
          >
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">팀 편집</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link
              href={ROUTES.PERFORMANCE.TEAM.DETAIL(team.performanceId, team.id)}
              onClick={(e) => {
                if (
                  guardNavigation(
                    ROUTES.PERFORMANCE.TEAM.DETAIL(team.performanceId, team.id)
                  )
                )
                  e.preventDefault()
              }}
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              바로가기
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-1 h-4 w-4" />
            {updateMutation.isPending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">팀 정보</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>팀명</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>팀장</Label>
            <Select
              value={leaderId.toString()}
              onValueChange={(v) => setLeaderId(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <UserSelectContent users={users} />
            </Select>
          </div>

          <div className="space-y-2">
            <Label>곡명</Label>
            <Input
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>아티스트</Label>
            <Input
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input
              value={songYoutubeVideoUrl}
              onChange={(e) => setSongYoutubeVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="flex items-center gap-6 pt-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={isFreshmenFixed}
                onCheckedChange={setIsFreshmenFixed}
              />
              <Label>신입생 고정</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isSelfMade} onCheckedChange={setIsSelfMade} />
              <Label>자작곡</Label>
            </div>
          </div>
        </div>
      </div>

      {/* 세션/멤버 편집 */}
      <TeamSessionsEditor
        memberSessions={memberSessions}
        onChange={setMemberSessions}
        teamDetail={team}
      />
    </div>
  )
}
