import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Inactive" | "Active"
  className?: string
  dotClassName?: string
}

const STATUS_LABEL: Record<StatusBadgeProps["status"], string> = {
  Active: "Active",
  Inactive: "Closed"
}

const StatusBadge = ({
  status,
  className,
  dotClassName = "text-[0.5rem]"
}: StatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "Inactive"
          ? "bg-red-100 text-destructive"
          : "bg-green-100 text-green-600",
        "text-md whitespace-nowrap rounded-full border-none px-4 py-0.5 lg:py-1 font-semibold",
        className
      )}
    >
      <span className={cn("me-2", dotClassName)}>●</span>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export default StatusBadge
