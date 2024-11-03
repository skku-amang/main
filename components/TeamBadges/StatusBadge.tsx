import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "Inactive" | "Active"
  className?: string
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "Inactive"
          ? "bg-red-100 text-destructive"
          : "bg-green-100 text-green-600",
        "text-md rounded-full border-none px-4 py-1",
        className
      )}
    >
      <span className="me-2 font-extrabold">●</span>
      {status}
    </Badge>
  )
}

export default StatusBadge
