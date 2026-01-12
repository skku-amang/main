"use client"

import Loading from "@/app/_(errors)/Loading"
import { useUser } from "@/hooks/api/useUser"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface JoinedTeam {
  teamSession: {
    team: {
      name: string
    }
  }
}

interface UserWithJoinedTeams {
  joinedTeams: JoinedTeam[]
}

const ProfileTeamsPage = () => {
  const { data: session, status } = useSession()
  const [userId, setUserId] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(Number(session.user.id))
    }
  }, [session?.user?.id])

  const { data: user, isLoading } = useUser(userId, {
    enabled: !!userId // userId가 있을 때만 쿼리 실행
  })

  if (status === "loading" || isLoading || !user) {
    return <Loading />
  }

  const userDetail = user as unknown as UserWithJoinedTeams

  return (
    <div>
      {userDetail.joinedTeams
        ?.map((team: JoinedTeam) => team.teamSession.team.name)
        .join(", ") || "참여 팀 없음"}
    </div>
  )
}

export default ProfileTeamsPage
