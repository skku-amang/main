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
  const [isLargeScreen, setIsLargeScreen] = useState(false) // 768px 이상
  const [isMediumScreen, setIsMediumScreen] = useState(false) // 410px 이상
  const [isSmallScreen, setIsSmallScreen] = useState(false) // 410px 이하

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsLargeScreen(width >= 768)
      setIsMediumScreen(width >= 470 && width < 768)
      setIsSmallScreen(width < 470)
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
    <div className="relative h-full w-full">
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
        <Image
          src={
            Pressed
              ? SESSIONIMAGE.PRESSED[session]
              : SESSIONIMAGE.UNPRESSED[session]
          }
          alt={`${session} session image`}
          className="absolute left-0 top-0"
          // 화면 크기에 따라 width와 height 설정
          width={
            isLargeScreen
              ? undefined
              : isMediumScreen
                ? 125
                : isSmallScreen
                  ? 80
                  : 80
          }
          height={
            isLargeScreen
              ? undefined
              : isMediumScreen
                ? 125
                : isSmallScreen
                  ? 80
                  : 80
          }
          fill={isLargeScreen ? true : undefined} // 768px 이상일 때만 fill 적용
        />
        {/* 세션명 */}
        <div className="absolute right-[8px] z-10 text-center font-['Inter'] text-sm font-semibold text-slate-600 md:right-[16px] md:text-2xl">
          {memberSessionWithIndex}
        </div>
      </div>
      <div
        className={cn(
          "absolute -right-2 -top-2 ml-1 h-5 w-5 items-center justify-center rounded-full bg-primary text-white md:-right-4 md:-top-4 md:h-8 md:w-8",
          Pressed ? "block overflow-visible opacity-100" : "hidden"
        )}
      >
        <Check className="h-[20px] w-[20px] pb-[1px] pt-[3px] md:h-[32px] md:w-[32px]" />
      </div>
    </div>
  )
}

export default ApplyButton
