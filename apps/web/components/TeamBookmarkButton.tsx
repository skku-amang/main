"use client"

import { Star } from "lucide-react"

import { useToggleTeamBookmark } from "@/hooks/api/useTeamBookmark"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"

interface TeamBookmarkButtonProps {
  teamId: number
  bookmarked: boolean
  className?: string
}

const TeamBookmarkButton = ({
  teamId,
  bookmarked,
  className
}: TeamBookmarkButtonProps) => {
  const { isAuthenticated } = useAuth()
  const toggle = useToggleTeamBookmark()

  if (!isAuthenticated) return null

  return (
    <button
      type="button"
      aria-label="별표"
      aria-pressed={bookmarked}
      onClick={() => toggle(teamId, bookmarked)}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors hover:bg-slate-100",
        className
      )}
    >
      <Star
        className={cn(
          "size-5",
          bookmarked ? "fill-amber-400 text-amber-400" : "text-slate-300"
        )}
      />
    </button>
  )
}

export default TeamBookmarkButton
