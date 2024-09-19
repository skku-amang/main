import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const StatusBadge = ({ status }: { status: "Inactive" | "Active" }) => {
  const className =
    status === "Inactive"
      ? "bg-red-100 text-destructive"
      : "bg-green-100 text-green-600"
  return (
    <div className="flex justify-center">
      <Badge
        variant="outline"
        className={cn(
          className,
          "text-md font-lig rounded-full border-none px-4 py-1"
        )}
      >
        <span className="me-2 font-extrabold">●</span>
        {status}
      </Badge>
    </div>
  )
}

export default StatusBadge
