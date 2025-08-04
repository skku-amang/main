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
  const [selectedSession, setSelectedSession] =
    useState<SelectedSessionWithIndex | null>(null)

  const onApply = async () => {
    if (!selectedSession) {
      toast({
        title: "세션 선택 오류",
        description: "세션을 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    const { sessionId, index } = selectedSession

    const result = await teamApplication.mutateAsync({
      sessionId,
      index
    })

    // TODO: useMutation에서 실패 처리 아키텍처 추가
    if (!result) {
      toast({
        title: "신청 실패",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
    return result
  }

  return {
    selectedSession,
    setSelectedSession,
    onApply
  }
}

export default useTeamApplication
