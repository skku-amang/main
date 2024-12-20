import React from "react"

import useTeamDelete from "@/hooks/Team/useTeamDelete"

interface DeleteButtonProps {
  children: React.ReactNode
  className?: string
  teamId: number
}

const DeleteButton = ({ children, className, teamId }: DeleteButtonProps) => {
  const { deleteTeam } = useTeamDelete()

  const onDelete = async () => {
    await deleteTeam(teamId)
  }

  return (
    <div onClick={onDelete} className={className}>
      {children}
    </div>
  )
}

export default DeleteButton