"use client"

import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getSessionDisplayName } from "@/constants/session"
import { useUsers } from "@/hooks/api/useUser"
import { formatGenerationOrder } from "@/lib/utils"

interface MemberSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (userId: number) => void
  excludeUserIds: Set<number>
}

export function MemberSelectDialog({
  open,
  onOpenChange,
  onSelect,
  excludeUserIds
}: MemberSelectDialogProps) {
  const { data: users } = useUsers()
  const [search, setSearch] = useState("")

  const filteredUsers =
    users
      ?.filter((u) => !excludeUserIds.has(u.id))
      .filter(
        (u) =>
          !search ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.nickname.toLowerCase().includes(search.toLowerCase())
      ) ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>멤버 선택</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="이름 또는 닉네임 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-80 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                  onClick={() => {
                    onSelect(user.id)
                    setSearch("")
                  }}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.nickname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatGenerationOrder(user.generation.order)}기
                      </span>
                    </div>
                    {user.sessions.length > 0 && (
                      <div className="mt-0.5 flex gap-1">
                        {user.sessions.map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {getSessionDisplayName(s.name)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
