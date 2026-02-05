import { useSession } from "next-auth/react"

export const useTeamPermission = (team: { leaderId: number } | undefined) => {
  const { data: session } = useSession()

  const canEdit =
    !!session?.user &&
    !!team &&
    (session.user.isAdmin ||
      (!!session.user.id && +session.user.id === team.leaderId))

  return { canEdit }
}
