"use client"

import { useState } from "react"
import dayjs from "dayjs"
import { ArrowRight, Clock, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { RentalDetail } from "@repo/shared-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/hooks/use-toast"
import { useDeleteRental } from "@/hooks/api/useRental"

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
  const { data: session } = useSession()
  const deleteRental = useDeleteRental()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!rental) return null

  const currentUserId = session?.user?.id ? Number(session.user.id) : null
  const canDelete =
    rental.users.some((u) => u.id === currentUserId) ||
    session?.user?.isAdmin === true

  const handleDelete = () => {
    deleteRental.mutate([rental.id], {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rentals"] })
        onOpenChange(false)
        toast({ title: "예약이 삭제되었습니다." })
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description:
            error instanceof Error
              ? error.message
              : "예약을 삭제하지 못했습니다."
        })
      }
    })
  }

  const start = dayjs(rental.startAt)
  const end = dayjs(rental.endAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[486px] rounded-3xl border-0 bg-[#F0FDF4] p-6 gap-4 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.05),0px_4px_50px_0px_rgba(0,0,0,0.08)]">
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
            <Clock
              size={24}
              className="shrink-0"
              style={{ color: "#15803D" }}
            />
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
          <ArrowRight
            size={32}
            className="shrink-0"
            style={{ color: "#15803D" }}
          />

          {/* To */}
          <div className="flex items-center gap-2">
            <Clock
              size={24}
              className="shrink-0"
              style={{ color: "#15803D" }}
            />
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
            <div className="flex flex-wrap gap-1.5">
              {rental.users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-1 min-w-[120px] basis-[140px] items-center gap-1 rounded-lg border px-2 py-1.5"
                  style={{
                    borderColor: "rgba(197, 197, 197, 0.5)",
                    borderWidth: "0.5px"
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
        {/* Delete button */}
        {canDelete && (
          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteRental.isPending}
            >
              <Trash2 size={14} className="mr-1.5" />
              {deleteRental.isPending ? "삭제 중..." : "예약 삭제"}
            </Button>
          </div>
        )}
      </DialogContent>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{rental.title}&rdquo; 예약이 영구적으로 삭제됩니다. 이
              작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
