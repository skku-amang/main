import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getRepresentativeRelativeTime } from "@/lib/utils"

interface AvatarCustomedProps {
  /** 전체 컨테이너의 className (flex, gap 등) */
  className?: string
  /** 아바타 크기 조절용 className (w-12 h-12 등) */
  avatarClassName?: string
  /** 이름/세대 텍스트 부분 className */
  nameClassName?: string
  /** 시간 텍스트 부분 className */
  timeClassName?: string
  generation: number
  name: string
  time: Date | string
  /** 이미지 주소 (기본값: shadcn placeholder) */
  src?: string
}

export default function AvatarCustomed({
  className,
  avatarClassName,
  nameClassName,
  timeClassName,
  generation,
  name,
  time,
  src = "https://github.com/shadcn.png"
}: AvatarCustomedProps) {
  const date = typeof time === "string" ? new Date(time) : time

  return (
    <div
      className={cn(
        "flex items-center gap-[10px] w-fit h-auto", // 기본 구조
        className // 사용자 지정 덮어쓰기
      )}
    >
      <Avatar className={cn("w-12 h-12 shrink-0", avatarClassName)}>
        <AvatarImage src={src} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex gap-2 items-center leading-tight">
        <span
          className={cn("text-primary text-base font-medium", nameClassName)}
        >
          {generation}기 {name}
        </span>
        <span
          className={cn("text-gray-400 text-sm font-normal", timeClassName)}
        >
          {getRepresentativeRelativeTime(date)}
        </span>
      </div>
    </div>
  )
}
