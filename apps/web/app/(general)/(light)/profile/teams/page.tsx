"use client"

import Loading from "@/app/_(errors)/Loading"
import { useUser } from "@/hooks/api/useUser"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const ProfileTeamsPage = () => {
  const { data: session, status } = useSession()
  const [userId, setUserId] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(Number(session.user.id))
    }
  }, [session?.user?.id])
  console.log(session)
  console.log(userId)

  const { data: user, isLoading } = useUser(userId, {
    enabled: !!userId // userId가 있을 때만 쿼리 실행
  })

  if (status === "loading" || isLoading || !user) {
    return <Loading />
  }

  return (
    <div>
      {user.joinedTeams.map((team) => team.teamSession.team.name).join(", ")}
    </div>
  )
}

export default ProfileTeamsPage
