import { StatusCodes } from "http-status-codes"
import { useSession } from "next-auth/react"
import React from "react"

import { useToast } from "@/components/hooks/use-toast"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import fetchData from "@/lib/fetch"

interface DeleteButtonProps {
  children: React.ReactNode
  className?: string
  teamId: number
}

const DeleteButton = ({ children, className, teamId }: DeleteButtonProps) => {
  const authSession = useSession()
  const { toast } = useToast()

  async function onDelete() {
    const res = await fetchData(
      API_ENDPOINTS.TEAM.DELETE(teamId) as ApiEndpoint,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${authSession.data?.access}`
        }
      }
    )

    if (!res.ok) {
      switch (res.status) {
        case StatusCodes.FORBIDDEN:
          toast({
            title: "팀 삭제 실패",
            description: "팀 삭제 권한이 없습니다.",
            variant: "destructive"
          })
          break
        case StatusCodes.NOT_FOUND:
          toast({
            title: "팀 삭제 실패",
            description: "존재하지 않는 팀입니다.",
            variant: "destructive"
          })
          break
        default:
          toast({
            title: "팀 삭제 실패",
            description: (await res.json())?.detail || "알 수 없는 에러 발생",
            variant: "destructive"
          })
      }
    }

    toast({
      title: "팀 삭제 완료",
      description: "성공적으로 팀이 삭제되었습니다!"
    })
  }

  return (
    <div onClick={onDelete} className={className}>
      {children}
    </div>
  )
}

export default DeleteButton
