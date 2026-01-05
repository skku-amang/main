"use client"

import { useDeleteTeam } from "@/hooks/api/useTeam"
import React from "react"

interface DeleteButtonProps {
  children: React.ReactNode
  className?: string
  teamId: number
}

const DeleteButton = ({ children, className, teamId }: DeleteButtonProps) => {
  const { mutateAsync, error, isError } = useDeleteTeam()

  const onDelete = async () => {
    await mutateAsync([teamId])
    if (isError) {
      console.error("팀 삭제 오류:", error)
      alert("팀 삭제에 실패했습니다. 다시 시도해주세요.")
    } else {
      alert("팀이 삭제되었습니다.")
    }
  }

  return (
    <div onClick={onDelete} className={className}>
      {children}
    </div>
  )
}

export default DeleteButton
