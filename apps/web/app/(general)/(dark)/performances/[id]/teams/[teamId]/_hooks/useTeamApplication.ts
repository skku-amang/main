import { useToast } from "@/components/hooks/use-toast"
import { useTeamApplication as useTeamApplicationOriginal } from "@/hooks/api/useTeam"
import { useState } from "react"

type SelectedSessionWithIndex = {
  sessionId: number
  index: number
}

const useTeamApplication = (teamId: number) => {
  const { toast } = useToast()
  const teamApplication = useTeamApplicationOriginal(teamId)
  const [selectedSessions, setSelectedSessions] = useState<
    SelectedSessionWithIndex[]
  >([])

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
    teamApplication.mutateAsync(selectedSessions)
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
