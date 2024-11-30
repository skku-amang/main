"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"

import { useToast } from "@/components/hooks/use-toast"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import SESSIONIMAGE from "@/constants/sessionimage"
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

    const data = (await res.json()) as Team
    toast({
      title: "지원 완료",
      description: "성공적으로 팀에 등록되었습니다!"
    })
    onApplySuccess(data)
  }

  return (
    <div
      className="flex items-center rounded border"
      style={{
        borderRadius: "5px"
      }}
    >
      <Image
        src={SESSIONIMAGE.PRESSED[session]} // session을 키로 사용
        alt={`${session} session image`}
        width={200} // 원하는 이미지 너비
        height={100} // 원하는 이미지 높이
      />
      {/* 세션명 */}
      <div className="mb-2 text-center font-['Inter'] text-2xl font-semibold text-slate-600">
        {memberSessionWithIndex}
      </div>
    </div>
  )
}

export default ApplyButton
