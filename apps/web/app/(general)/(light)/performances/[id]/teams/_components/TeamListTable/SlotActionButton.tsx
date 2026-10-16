"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { useApplyToTeam, useUnapplyFromTeam } from "@/hooks/api/useTeam"
import { cn } from "@/lib/utils"

const COPY = {
  apply: { button: "지원", question: "자리에 지원할까요?", done: "지원 완료" },
  cancel: {
    button: "취소",
    question: "자리 지원을 취소할까요?",
    done: "지원 취소 완료"
  }
} as const

/** 표의 세션 자리에서 바로 지원하거나 내 지원을 취소. 실수 클릭을 막으려고 한 번 확인한다 */
const SlotActionButton = ({
  action,
  teamId,
  songName,
  sessionId,
  index,
  label
}: {
  action: keyof typeof COPY
  teamId: number
  songName: string
  sessionId: number
  index: number
  label: string
}) => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const copy = COPY[action]
  const callbacks = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["team", teamId] })
      toast({ title: copy.done, description: `${songName} · ${label}` })
      setOpen(false)
    },
    onError: (error: { detail?: string; message: string }) => {
      toast({
        title: `${copy.button} 실패`,
        description: error.detail ?? error.message,
        variant: "destructive"
      })
    }
  }
  const apply = useApplyToTeam(callbacks)
  const cancel = useUnapplyFromTeam(callbacks)
  const mutation = action === "apply" ? apply : cancel

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "whitespace-nowrap rounded-[5px] border px-2 py-0.5 text-xs font-medium transition-colors",
            action === "apply"
              ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white"
              : "border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"
          )}
        >
          {copy.button}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-3 text-sm">
        <p>
          <span className="font-semibold">{songName}</span>의{" "}
          <span className="font-semibold">{label}</span> {copy.question}
        </p>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            닫기
          </Button>
          <Button
            size="sm"
            variant={action === "cancel" ? "destructive" : "default"}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate([teamId, [{ sessionId, index }]])}
          >
            {copy.button}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default SlotActionButton
