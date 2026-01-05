import { useToast } from "@/components/hooks/use-toast"
import { useApplyToTeam } from "@/hooks/api/useTeam"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

type SelectedSessionWithIndex = {
  sessionId: number
  index: number
}

const useTeamApplication = (teamId: number) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedSessions, setSelectedSessions] = useState<
    SelectedSessionWithIndex[]
  >([])

  const applyMutation = useApplyToTeam({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] })
      toast({
        title: "지원 완료",
        description: "팀에 지원이 완료되었습니다."
      })
      setSelectedSessions([])
    },
    onError: () => {
      toast({
        title: "지원 실패",
        description: "팀 지원 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  })

  const isSelected = (sessionId: number, index: number) => {
    return selectedSessions.some(
      (s) => s.sessionId === sessionId && s.index === index
    )
  }

  const onAppendSession = (sessionId: number, index: number) => {
    setSelectedSessions((prev) => {
      if (isSelected(sessionId, index)) {
        toast({
          title: "이미 선택된 세션입니다.",
          description: "다른 세션을 선택해주세요.",
          variant: "destructive"
        })
        return prev
      }
      return [...prev, { sessionId, index }]
    })
  }

  const onRemoveSession = (sessionId: number, index: number) => {
    setSelectedSessions((prev) => {
      if (!isSelected(sessionId, index)) {
        toast({
          title: "선택되지 않은 세션입니다.",
          description: "다른 세션을 선택해주세요.",
          variant: "destructive"
        })
        return prev
      }
      return prev.filter((s) => s.sessionId !== sessionId || s.index !== index)
    })
  }

  const onSubmit = async () => {
    await applyMutation.mutateAsync([teamId, selectedSessions])
  }

  return {
    selectedSessions,
    setSelectedSessions,
    onAppendSession,
    onRemoveSession,
    onSubmit
  }
}

export default useTeamApplication
