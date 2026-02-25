"use client"

import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatGenerationOrder } from "@/lib/utils"
import ROUTES from "@/constants/routes"

interface BasicUser {
  id: number
  name: string
  image: string | null
  generation?: { id: number; order: number } | null
}

interface UserCellProps {
  user: BasicUser | null | undefined
  fallback?: React.ReactNode
}

export function UserCell({ user, fallback = "-" }: UserCellProps) {
  if (!user) return <>{fallback}</>

  return (
    <Link
      href={`${ROUTES.ADMIN.USERS}?rowId=${user.id}`}
      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
    >
      <Avatar className="h-5 w-5">
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
      </Avatar>
      <span>{user.name}</span>
      {user.generation && (
        <span className="text-xs text-muted-foreground">
          {formatGenerationOrder(user.generation.order)}기
        </span>
      )}
    </Link>
  )
}
