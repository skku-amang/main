'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading } from 'react-icons/ai'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Session } from '../../../types/Session'
import { Team } from '../../../types/Team'
import { User } from '../../../types/User'
import { Input } from '../ui/input'

interface Props {
  team: Team
  session: Session
  sessionIndex: number
  existingUser?: User
  user: User
}

interface FormData {
  teamId: string
  sessionId: string
  sessionIndex: number
}

const schema = z.object({
  teamId: z.string(),
  sessionId: z.string(),
  sessionIndex: z.number(),
})

const SessionApplyButton = ({ team, session, sessionIndex, existingUser, user }: Props) => {
  // 기존 신청 여부 상태 추가
  const [isApplied, setIsApplied] = useState(!!(existingUser && user.id === existingUser.id));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async () => {
    console.log("onSubmit called")
    try {
      const response = await fetch('/api/apply', {
        method: isApplied ? 'DELETE' : 'POST',  // 신청 상태에 따라 메서드 결정
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: session.id })
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      // 신청 상태 반전
      setIsApplied(!isApplied);

    } catch (error) {
      console.error('Error applying for session:', error)
      setError('root', { type: 'manual', message: '신청에 실패했습니다.' })
      setIsDialogOpen(true)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input type="hidden" {...register('teamId')} value={team.id} />
        <Input type="hidden" {...register('sessionId')} value={session.id} />
        <Input type="hidden" {...register('sessionIndex')} value={sessionIndex} />

        <Button type="submit">
          {isSubmitting ? <AiOutlineLoading className="animate-spin" size={24} /> : isApplied ? '신청 취소' : `${session.name} 참가 신청`}
        </Button>
        <input type="submit" />
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              {Object.entries(errors).map(([key, error]) => error.message).join(', ')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SessionApplyButton
