import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { PlusCircle } from "lucide-react"

interface AddScheduleButtonProps {
  className?: string
}

export default function AddScheduleButton({
  className
}: AddScheduleButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "text-gray-50 w-36 h-9 text-sm font-medium bg-primary",
            className
          )}
        >
          <div className="flex gap-2 justify-center items-center">
            <PlusCircle size={18} />
            Add Schedule
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ㅎㅇㅎㅇ</DialogTitle>
          <DialogDescription>아직 없음</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
