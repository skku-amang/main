"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>멤버 선택</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="이름 또는 닉네임 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    onSelect(user.id)
                    setSearch("")
                  }}
                >
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2 text-neutral-500">
                    ({user.nickname})
                  </span>
                  <span className="ml-auto text-xs text-neutral-400">
                    {formatGenerationOrder(user.generation.order)}기
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
