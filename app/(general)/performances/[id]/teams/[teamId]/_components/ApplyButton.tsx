"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

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
  const [isLargeScreen, setIsLargeScreen] = useState(true) // 기본적으로 768px 이상으로 설정

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768)
    }

    // Resize 이벤트 리스너 추가
    window.addEventListener("resize", handleResize)

    // 초기 화면 크기 체크
    handleResize()

    // cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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
        "relative flex h-[100px] w-full items-center overflow-hidden rounded bg-slate-50 max-[470px]:h-[60px] md:h-[160px] md:w-[250px] md:overflow-visible",
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
          Pressed ? "op opactiy-100 block overflow-visible" : "hidden"
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
        className="absolute left-0 top-0"
        // 768px 이상이면 fill 적용, 그렇지 않으면 width와 height를 200으로 설정
        width={isLargeScreen ? undefined : 80}
        height={isLargeScreen ? undefined : 80}
        fill={isLargeScreen ? true : undefined} // 768px 이상일 때만 fill 적용
      />
      {/* 세션명 */}
      <div className="absolute right-[8px] z-10 text-center font-['Inter'] text-sm font-semibold text-slate-600 md:right-[16px] md:text-2xl">
        {memberSessionWithIndex}
      </div>
    </div>
  )
}

export default ApplyButton
