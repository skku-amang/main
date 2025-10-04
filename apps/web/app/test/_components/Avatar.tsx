import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getRepresentativeRelativeTime } from "@/lib/utils"

interface AvartarProps {
  className?: string
  generation: number
  name: string
  time: Date
}

export default function AvatarInfo({
  className,
  generation,
  name,
  time
}: AvartarProps) {
  return (
    <div className={cn(className, "w-56 h-auto flex gap-[10px] items-center")}>
      <Avatar className="w-12 h-12">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <span className="text-primary text-base font-medium">
          {generation + `기 ` + name}
        </span>
        <span className="text-gray-400 text-base font-normal">
          {getRepresentativeRelativeTime(time)}
        </span>
      </div>
    </div>
  )
}
