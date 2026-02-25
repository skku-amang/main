"use client"

import { useDeleteTeam } from "@/hooks/api/useTeam"
import { useQueryClient } from "@tanstack/react-query"
import React from "react"

interface DeleteButtonProps {
  children: React.ReactNode
  className?: string
  teamId: number
}

const DeleteButton = ({ children, className, teamId }: DeleteButtonProps) => {
  const { mutateAsync } = useDeleteTeam()
  const queryClient = useQueryClient()

  const onDelete = async () => {
    try {
      await mutateAsync([teamId])
      await queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.removeQueries({ queryKey: ["team", teamId] })
      alert("팀이 삭제되었습니다.")
    } catch (err) {
      console.error("팀 삭제 오류:", err)
      alert("팀 삭제에 실패했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div onClick={onDelete} className={className}>
      {children}
    </div>
  )
}

export default DeleteButton
