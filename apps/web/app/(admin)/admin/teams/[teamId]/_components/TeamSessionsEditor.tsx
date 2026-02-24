"use client"

import { Minus, Plus, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getSessionDisplayName } from "@/constants/session"
import { useSessions } from "@/hooks/api/useSession"
import { useUsers } from "@/hooks/api/useUser"
import { TeamDetail } from "@repo/shared-types"

import { MemberSelectDialog } from "./MemberSelectDialog"

type MemberSessionState = {
  sessionId: number
  capacity: number
  members: { userId: number; index: number }[]
}

interface TeamSessionsEditorProps {
  memberSessions: MemberSessionState[]
  onChange: (sessions: MemberSessionState[]) => void
  teamDetail: TeamDetail
}

export function TeamSessionsEditor({
  memberSessions,
  onChange,
  teamDetail
}: TeamSessionsEditorProps) {
  const { data: sessions } = useSessions()
  const { data: users } = useUsers()
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(
    null
  )

  // 현재 사용되지 않은 세션 목록
  const usedSessionIds = new Set(memberSessions.map((ms) => ms.sessionId))
  const availableSessions =
    sessions?.filter((s) => !usedSessionIds.has(s.id)) ?? []

  const addSession = (sessionId: number) => {
    onChange([...memberSessions, { sessionId, capacity: 1, members: [] }])
  }

  const removeSession = (index: number) => {
    onChange(memberSessions.filter((_, i) => i !== index))
  }

  const updateCapacity = (index: number, capacity: number) => {
    if (capacity < 1) return
    const current = memberSessions[index]!
    const updated = [...memberSessions]
    updated[index] = {
      sessionId: current.sessionId,
      capacity,
      // capacity보다 큰 index의 멤버 제거
      members: current.members.filter((m) => m.index <= capacity)
    }
    onChange(updated)
  }

  const removeMember = (sessionIndex: number, userId: number) => {
    const current = memberSessions[sessionIndex]!
    const updated = [...memberSessions]
    updated[sessionIndex] = {
      sessionId: current.sessionId,
      capacity: current.capacity,
      members: current.members.filter((m) => m.userId !== userId)
    }
    onChange(updated)
  }

  const addMember = (sessionIndex: number, userId: number) => {
    const current = memberSessions[sessionIndex]!
    // 다음 빈 index 찾기
    const usedIndices = new Set(current.members.map((m) => m.index))
    let nextIndex = 1
    while (usedIndices.has(nextIndex) && nextIndex <= current.capacity) {
      nextIndex++
    }
    if (nextIndex > current.capacity) return

    const updated = [...memberSessions]
    updated[sessionIndex] = {
      sessionId: current.sessionId,
      capacity: current.capacity,
      members: [...current.members, { userId, index: nextIndex }]
    }
    onChange(updated)
    setMemberDialogOpen(false)
  }

  const getSessionName = (sessionId: number): string => {
    // teamDetail에서 먼저 찾기
    const ts = teamDetail.teamSessions.find((ts) => ts.sessionId === sessionId)
    if (ts) return getSessionDisplayName(ts.session.name)

    // sessions 데이터에서 찾기
    const session = sessions?.find((s) => s.id === sessionId)
    return session ? getSessionDisplayName(session.name) : `세션 ${sessionId}`
  }

  const getUserName = (userId: number): string => {
    // teamDetail에서 먼저 찾기
    for (const ts of teamDetail.teamSessions) {
      const member = ts.members.find((m) => m.userId === userId)
      if (member) return `${member.user.name} (${member.user.nickname})`
    }

    // users 데이터에서 찾기
    const user = users?.find((u) => u.id === userId)
    return user ? `${user.name} (${user.nickname})` : `유저 ${userId}`
  }

  // 현재 팀에 이미 배정된 유저 ID 모음 (멤버 중복 배정 방지용)
  const assignedUserIds = new Set(
    memberSessions.flatMap((ms) => ms.members.map((m) => m.userId))
  )

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">세션 구성</h2>
        {availableSessions.length > 0 && (
          <Select onValueChange={(v) => addSession(parseInt(v))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="세션 추가" />
            </SelectTrigger>
            <SelectContent>
              {availableSessions.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {getSessionDisplayName(s.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {memberSessions.length === 0 ? (
        <p className="py-8 text-center text-neutral-500">
          세션이 없습니다. 세션을 추가해주세요.
        </p>
      ) : (
        <div className="space-y-4">
          {memberSessions.map((ms, sessionIndex) => (
            <div key={ms.sessionId} className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {getSessionName(ms.sessionId)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateCapacity(sessionIndex, ms.capacity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={ms.capacity}
                      onChange={(e) =>
                        updateCapacity(
                          sessionIndex,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="h-6 w-12 text-center"
                      min={1}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateCapacity(sessionIndex, ms.capacity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="secondary">
                    {ms.members.length}/{ms.capacity}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => removeSession(sessionIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* 멤버 목록 */}
              <div className="flex flex-wrap gap-2">
                {ms.members
                  .sort((a, b) => a.index - b.index)
                  .map((member) => (
                    <Badge
                      key={member.userId}
                      variant="outline"
                      className="flex items-center gap-1 py-1"
                    >
                      <span className="text-neutral-400">{member.index}.</span>
                      {getUserName(member.userId)}
                      <button
                        onClick={() =>
                          removeMember(sessionIndex, member.userId)
                        }
                        className="ml-1 rounded-full hover:bg-neutral-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}

                {ms.members.length < ms.capacity && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      setEditingSessionIndex(sessionIndex)
                      setMemberDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    멤버 추가
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <MemberSelectDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        onSelect={(userId) => {
          if (editingSessionIndex !== null) {
            addMember(editingSessionIndex, userId)
          }
        }}
        excludeUserIds={assignedUserIds}
      />
    </div>
  )
}
