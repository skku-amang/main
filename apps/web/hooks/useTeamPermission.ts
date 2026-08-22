import { useAuth } from "@/lib/providers/auth-provider"

export const useTeamPermission = (team: { leaderId: number } | undefined) => {
  const { user } = useAuth()

  const canEdit =
    !!user && !!team && (user.isAdmin || user.id === team.leaderId)

  return { canEdit }
}
