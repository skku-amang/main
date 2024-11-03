"use client"

import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"
import { SessionName } from "@/types/Session"
import { Team } from "@/types/Team"

interface ApplyButtonProps {
  teamId: number
  session: SessionName
  memberSessionIndex: number
  // eslint-disable-next-line no-unused-vars
  onApplySuccess: (team: Team) => void
}

const ApplyButton = ({
  teamId,
  session,
  memberSessionIndex,
  onApplySuccess
}: ApplyButtonProps) => {
  const authSession = useSession()
  const { toast } = useToast()
  const memberSessionWithIndex = `${session}${memberSessionIndex}`

  async function onApply() {
    const res = await fetchData(
      API_ENDPOINTS.TEAM.APPLY(teamId) as ApiEndpoint,
      {
        body: JSON.stringify({ session, index: memberSessionIndex }),
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${authSession.data?.access}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!res.ok) {
      toast({
        title: "세션 지원 실패",
        description: (await res.json())?.detail || "알 수 없는 에러 발생",
        variant: "destructive"
      })
      return
    }

    const data = await res.json()
    toast({
      title: "지원 완료",
      description: "성공적으로 팀에 등록되었습니다!"
    })
    onApplySuccess(data)
  }

  return (
    <div
      className="rounded border px-10 py-3"
      style={{
        borderRadius: "5px"
      }}
    >
      {/* 세션명 */}
      <div className="mb-2 text-center">{memberSessionWithIndex}</div>

      {/* 지원 버튼 */}
      <div className="flex justify-center">
        <Button className="h-7 text-sm" onClick={onApply}>
          지원하기
        </Button>
      </div>
    </div>
  )
}

export default ApplyButton
