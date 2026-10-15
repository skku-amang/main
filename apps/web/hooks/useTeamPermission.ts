import { useAuth } from "@/lib/providers/auth-provider"

export const useTeamPermission = (team: { leaderId: number } | undefined) => {
  const { user, isLoading } = useAuth()

  const canEdit =
    !!user && !!team && (user.isAdmin || user.id === team.leaderId)

  // 로그인 정보가 오기 전에는 canEdit이 false라 "권한 없음"과 구분해야 함
  return { canEdit, isLoading }
}
