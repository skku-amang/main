import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SessionBadgeProps {
  session: string
  size?: "small" | "large"
  className?: string
}

const SessionBadge = ({
  session,
  size = "small",
  className
}: SessionBadgeProps) => {
  if (size === "large") {
    return (
      <Badge
        className={cn(
          "rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-600 md:h-9 md:rounded-[20px] md:px-3 md:py-1.5 md:text-base md:font-normal md:text-slate-700 hover:bg-neutral-200 text-nowrap select-none",
          className
        )}
      >
        {session}
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        "h-6 rounded-[5px] bg-neutral-200 px-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 text-nowrap select-none",
        className
      )}
    >
      {session}
    </Badge>
  )
}

export default SessionBadge
