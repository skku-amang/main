import { cn } from "@/lib/utils"
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"

type AvatarSize = "xs" | "sm" | "md" | "lg"

interface AvatarProps {
  className?: string
  size?: AvatarSize

  name: string
  timeLabel: string

  imageSrc?: string
  imageAlt?: string
  fallback?: string
}

const SIZE_STYLES: Record<
  AvatarSize,
  {
    avatar: string
    gap: string
    nameText: string
    timeText: string
  }
> = {
  xs: {
    avatar: "h-6 w-6",
    gap: "gap-2",
    nameText: "text-sm",
    timeText: "text-xs"
  },
  sm: {
    avatar: "h-7 w-7",
    gap: "gap-2.5",
    nameText: "text-base",
    timeText: "text-sm"
  },
  md: {
    avatar: "h-8 w-8",
    gap: "gap-3",
    nameText: "text-lg",
    timeText: "text-base"
  },
  lg: {
    avatar: "h-10 w-10",
    gap: "gap-3.5",
    nameText: "text-xl",
    timeText: "text-lg"
  }
}

export default function Avatar({
  className,
  size = "md",
  name,
  timeLabel,
  imageSrc = "https://github.com/shadcn.png",
  imageAlt = "@shadcn",
  fallback
}: AvatarProps) {
  const s = SIZE_STYLES[size]

  const fb =
    fallback ??
    (name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 2) ||
      "?")

  return (
    <div className={cn("w-full flex items-center min-w-0", s.gap, className)}>
      <UiAvatar className={cn(s.avatar, "shrink-0")}>
        <AvatarImage src={imageSrc} alt={imageAlt} />
        <AvatarFallback className="text-xs font-medium">{fb}</AvatarFallback>
      </UiAvatar>

      <div className="min-w-0 flex items-baseline gap-3">
        {/* 이름: 절대 말줄임 금지 */}
        <span
          className={cn(
            "font-semibold text-slate-900 whitespace-nowrap",
            s.nameText
          )}
        >
          {name}
        </span>

        {/* 시간: 필요 시만 줄어들 수 있음 */}
        <span className={cn("text-slate-400 whitespace-nowrap", s.timeText)}>
          {timeLabel}
        </span>
      </div>
    </div>
  )
}
