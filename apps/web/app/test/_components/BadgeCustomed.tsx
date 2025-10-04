import { cn } from "@/lib/utils"

interface BadgeCustomedProps {
  className?: string
}

export default function BadgeCustomed({ className }: BadgeCustomedProps) {
  return <div className={cn(className)}></div>
}
