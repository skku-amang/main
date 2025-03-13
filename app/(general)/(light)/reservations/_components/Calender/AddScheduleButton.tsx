import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

export function AddScheduleButton({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={`${className}`} variant="outline">
          <div className="flex w-28 items-center justify-center  gap-2">
            <PlusCircle />
            <span>Add Schdule</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Add Schedule</DialogTitle>
        <div className="text-Zinc-500 h-5 justify-start self-stretch  text-sm font-normal leading-tight">
          예약 정보를 입력해주세요
        </div>
      </DialogContent>
    </Dialog>
  )
}
