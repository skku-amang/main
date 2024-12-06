"use client"
import { Edit3, Link, Trash2 } from "lucide-react"

import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"
import { Team } from "@/types/Team"

interface DeleteEditButtonProps {
  performanceId: number
  team: Team
  className?: string
  accessToken?: string
}

const DeleteEditButton = ({
  performanceId,
  team,
  className,
  accessToken
}: DeleteEditButtonProps) => {
  {
    /*const router = useRouter()*/
  } // 여기서 자꾸 오류가 발생합니다...

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
      {
        /*router.push(ROUTES.PERFORMANCE.TEAM.LIST(performanceId))*/
      }
    })
  }

  return (
    <div
      className={`flex items-center justify-center gap-x-[12px] ${className}`}
    >
      <Button variant="outline" className="h-[40px] w-[40px] p-[5px] shadow">
        <Link
          className="h-full w-full text-white hover:animate-none"
          href={ROUTES.PERFORMANCE.TEAM.EDIT(team.performance.id, team.id)}
        >
          <Edit3 strokeWidth={1} className="text-gray-600" />
        </Link>
      </Button>
      <form className="h-[40px] w-[40px]" action={onDeleteButtonClick}>
        <Button
          type="submit"
          variant="outline"
          className="h-[40px] w-[40px] p-[5px] shadow"
        >
          <Trash2 strokeWidth={1.25} className="text-gray-600 " />
        </Button>
      </form>
    </div>
  )
}

export default DeleteEditButton
