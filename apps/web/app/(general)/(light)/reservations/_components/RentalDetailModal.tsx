"use client"

import dayjs from "dayjs"
import { ArrowRight, Clock } from "lucide-react"
import { RentalDetail } from "@repo/shared-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

interface RentalDetailModalProps {
  rental: RentalDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RentalDetailModal({
  rental,
  open,
  onOpenChange
}: RentalDetailModalProps) {
  if (!rental) return null

  const start = dayjs(rental.startAt)
  const end = dayjs(rental.endAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-0 bg-green-50 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {rental.title}
          </DialogTitle>
        </DialogHeader>

        {/* Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <div className="text-left">
              <p className="text-xl font-semibold">{start.format("HH:mm")}</p>
              <p className="text-xs text-muted-foreground">
                {start.format("dddd, MMMM DD, YYYY")}
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-muted-foreground" />
          <div className="text-left">
            <p className="text-xl font-semibold">{end.format("HH:mm")}</p>
            <p className="text-xs text-muted-foreground">
              {end.format("dddd, MMMM DD, YYYY")}
            </p>
          </div>
        </div>

        {/* Participants */}
        {rental.users && rental.users.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Participants
            </p>
            <div className="flex flex-wrap gap-2">
              {rental.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1"
                >
                  <Avatar className="h-6 w-6">
                    {user.image && <AvatarImage src={user.image} />}
                    <AvatarFallback className="text-[10px]">
                      {user.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[80px] truncate text-xs">
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
