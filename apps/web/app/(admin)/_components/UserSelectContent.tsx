"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SelectContent, SelectItem } from "@/components/ui/select"
import { formatGenerationOrder } from "@/lib/utils"

interface SelectableUser {
  id: number
  name: string
  nickname: string
  image: string | null
  generation: { id: number; order: number }
}

interface UserSelectContentProps {
  users: SelectableUser[] | undefined
  allowNone?: boolean
  noneLabel?: string
}

export function UserSelectContent({
  users,
  allowNone,
  noneLabel = "없음"
}: UserSelectContentProps) {
  return (
    <SelectContent>
      {allowNone && <SelectItem value="none">{noneLabel}</SelectItem>}
      {users?.map((user) => (
        <SelectItem key={user.id} value={user.id.toString()}>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
            <span className="text-muted-foreground">{user.nickname}</span>
            <span className="text-xs text-muted-foreground">
              {formatGenerationOrder(user.generation.order)}기
            </span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  )
}
