import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Inactive" | "Active"
  size?: "small" | "middle" | "large"
  className?: string
}

const STATUS_LABEL: Record<StatusBadgeProps["status"], string> = {
  Active: "Active",
  Inactive: "Closed"
}

const StatusBadge = ({
  status,
  size = "small",
  className
}: StatusBadgeProps) => {
  const colorClass =
    status === "Inactive"
      ? "bg-red-100 text-destructive"
      : "bg-green-100 text-green-600"

  if (size === "middle") {
    return (
      <Badge
        variant="outline"
        className={cn(
          colorClass,
          "h-7 whitespace-nowrap rounded-full border-none px-4 text-sm font-semibold leading-none tracking-[0.05em]",
          className
        )}
      >
        <span className="me-2 text-[0.5rem]">●</span>
        {STATUS_LABEL[status]}
      </Badge>
    )
  }

  if (size === "large") {
    return (
      <Badge
        variant="outline"
        className={cn(
          colorClass,
          "whitespace-nowrap rounded-full border-none px-4 py-1 text-xs font-semibold leading-none tracking-[0.05em] md:h-[32px] md:w-[130px] md:justify-center md:text-lg",
          className
        )}
      >
        <span className="me-2 text-xs">●</span>
        {STATUS_LABEL[status]}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        colorClass,
        "whitespace-nowrap rounded-full border-none px-4 py-0.5 text-[10px] font-semibold leading-none tracking-[0.05em] lg:py-1",
        className
      )}
    >
      <span className="me-2 text-[0.5rem]">●</span>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export default StatusBadge
