"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useState } from "react"

import { useToast } from "@/components/hooks/use-toast"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import SESSIONIMAGE from "@/constants/sessionimage"
import fetchData from "@/lib/fetch"
import { cn } from "@/lib/utils"
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

  const [Pressed, setPressedState] = useState<boolean>(false)

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
      className={cn(
        "relative flex items-center rounded bg-slate-50",
        Pressed ? "border-4 border-primary" : ""
      )}
      style={{
        borderRadius: "5px"
      }}
      onClick={() => setPressedState(!Pressed)}
    >
      <div
        className={cn(
          "absolute -right-4 -top-4 ml-1 h-8 w-8 items-center justify-center rounded-full bg-primary  text-white",
          Pressed ? "block" : "hidden"
        )}
      >
        <Check width={32} height={32} className="pb-[1px] pt-[3px]" />
      </div>

      <Image
        src={
          Pressed
            ? SESSIONIMAGE.PRESSED[session]
            : SESSIONIMAGE.UNPRESSED[session]
        }
        alt={`${session} session image`}
        width={180}
        height={180}
      />
      {/* 세션명 */}
      <div className="mb-2 text-center font-['Inter'] text-2xl font-semibold text-slate-600">
        {memberSessionWithIndex}
      </div>
    </div>
  )
}

export default ApplyButton
