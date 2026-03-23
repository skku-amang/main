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
      <DialogContent
        className="max-w-[486px] rounded-3xl border-0 p-6 gap-4"
        style={{
          backgroundColor: "#F0FDF4",
          boxShadow:
            "0px 4px 6px 0px rgba(0, 0, 0, 0.05), 0px 4px 50px 0px rgba(0, 0, 0, 0.08)"
        }}
      >
        <DialogHeader className="flex-row items-center justify-between gap-1.5">
          <DialogTitle
            className="text-2xl font-semibold"
            style={{ color: "#14532D" }}
          >
            {rental.title}
          </DialogTitle>
        </DialogHeader>

        {/* Time section */}
        <div className="flex items-center justify-between gap-3 px-1.5">
          {/* From */}
          <div className="flex items-center gap-2">
            <Clock size={24} className="shrink-0 text-white" />
            <div>
              <p className="text-xl font-bold" style={{ color: "#374151" }}>
                {start.format("HH:mm")}
              </p>
              <p className="text-xs font-normal" style={{ color: "#4B5563" }}>
                {start.format("dddd, MMMM DD, YYYY")}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight size={32} className="shrink-0 text-white" />

          {/* To */}
          <div className="flex items-center gap-2">
            <Clock size={24} className="shrink-0 text-white" />
            <div>
              <p className="text-xl font-bold" style={{ color: "#374151" }}>
                {end.format("HH:mm")}
              </p>
              <p className="text-xs font-normal" style={{ color: "#4B5563" }}>
                {end.format("dddd, MMMM DD, YYYY")}
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        {rental.users && rental.users.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "#71717A" }}>
              Participants
            </p>
            <div className="flex justify-between gap-1.5">
              {rental.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 rounded-lg border px-2 py-1.5"
                  style={{
                    borderColor: "rgba(197, 197, 197, 0.5)",
                    borderWidth: "0.5px",
                    width: 140
                  }}
                >
                  <Avatar className="h-6 w-6 shrink-0">
                    {user.image && <AvatarImage src={user.image} />}
                    <AvatarFallback className="text-[10px]">
                      {user.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="truncate text-xs font-medium"
                    style={{ color: "#7E7E7E" }}
                  >
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
