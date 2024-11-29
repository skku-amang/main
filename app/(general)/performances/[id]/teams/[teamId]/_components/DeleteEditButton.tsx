"use client"
import { Link, PenLine, Trash2 } from "lucide-react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { Team } from "@/types/Team"

interface BasicInfoProps {
  performanceId: number
  team: Team
  accessToken?: string
}
// 수정버튼 제대로 해놔야함
const DeleteEditButton = ({
  performanceId,
  team,
  accessToken
}: BasicInfoProps) => {
  const { toast } = useToast()

  function onDeleteButtonClick() {
    fetchData(API_ENDPOINTS.TEAM.DELETE(team.id) as ApiEndpoint, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(async (res) => {
      if (!res.ok) {
        switch (res.status) {
          default:
            toast({
              title: "팀 삭제 실패",
              description: "알 수 없는 이유",
              variant: "destructive"
            })
        }
      }
      toast({
        title: "팀 삭제 성공",
        description: "성공적으로 팀을 삭제했습니다."
      })
    })
  }

  return (
    <div className="flex items-center justify-center gap-x-5">
      <Button asChild variant="outline" className="h-12 w-12 p-2 shadow">
        <Link href={ROUTES.PERFORMANCE.TEAM.EDIT(team.performance.id, team.id)}>
          <PenLine strokeWidth={1.25} />
        </Link>
      </Button>
      <form action={onDeleteButtonClick}>
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-12 p-2 shadow"
        >
          <Trash2 strokeWidth={1.25} />
        </Button>
      </form>
    </div>
  )
}

export default DeleteEditButton
