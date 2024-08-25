'use client'

import { SubmitHandler, useForm } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { MemberSession, Team } from '../../../types/Team'
import { User } from '../../../types/User'
import { Button } from '../ui/button'
import { Input } from "../ui/input"

interface FormData {
  teamId: number
  sessionId: number
  sessionMemberIndex: number
}

const SubmitButton = ({ teamId, sessionId, sessionMemberIndex }: FormData) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { teamId, sessionId, sessionMemberIndex }
  })

  return (
    <form onSubmit={handleSubmit(async (data) => {
      console.log(data)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    })}>
      <Input type="hidden" {...register('teamId' )} />
      <Input type="hidden" {...register('sessionId' )} />
      <Input type="hidden" {...register('sessionMemberIndex' )} />

      <Button type="submit" disabled={isSubmitting}>등록</Button>
    </form>
  )
}

interface MemberSessionTableRowProps {
  team: Team
  memberSession: MemberSession
  largestRequiredMemberCount: number
  leader: User
}

const MemberSessionTableRow = ({ team, memberSession, largestRequiredMemberCount, leader }: MemberSessionTableRowProps) => {
  const memberName = (member: User) => (member.id === leader.id ? `${member.name}(리더)` : member.name)

  return (
    <TableRow>
      <TableCell>
        {memberSession.session.name}({memberSession.members.length}/{memberSession.requiredMemberCount})
      </TableCell>
      {Array.from({ length: largestRequiredMemberCount }, (_, index) => (
        <TableCell key={index} className="text-center">
          {index < memberSession.members.length ? (
            memberName(memberSession.members[index])
          ) : index < memberSession.requiredMemberCount ? (
            <SubmitButton teamId={team.id} sessionId={memberSession.session.id} sessionMemberIndex={index} />
          ) : (
            'X'
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface MemberSessionTableProps {
  team: Team
  memberSessions: MemberSession[]
  leader: User
}

const MemberSessionTable = ({ team, memberSessions, leader }: MemberSessionTableProps) => {
  const largestRequiredMemberCount = Math.max(
    ...memberSessions.map((memberSession) => memberSession.requiredMemberCount)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>멤버 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">세션</TableHead>
              {Array.from({ length: largestRequiredMemberCount }, (_, index) => (
                <TableHead key={index} className="text-center">
                  {index + 1}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberSessions.map((memberSession) => (
              <MemberSessionTableRow
                team={team}
                key={memberSession.session.id}
                memberSession={memberSession}
                largestRequiredMemberCount={largestRequiredMemberCount}
                leader={leader}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default MemberSessionTable
