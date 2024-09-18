"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { FaSpinner } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { SessionName } from "@/types/Session"
import { MemberSession, Team } from "@/types/Team"
import { User } from "@/types/User"

interface FormData {
  teamId: number
  session: SessionName
  sessionMemberIndex: number
}

interface SubmitButtonProps {
  teamId: number
  session: SessionName
  sessionMemberIndex: number
  initialMode: "signup" | "cancel"
}

const SubmitButton = ({
  teamId,
  session,
  sessionMemberIndex,
  initialMode
}: SubmitButtonProps) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<FormData>({
    defaultValues: { teamId, session, sessionMemberIndex }
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<"signup" | "cancel">(initialMode)

  async function onSubmit(data: FormData) {
    console.log(data)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setMode(mode === "signup" ? "cancel" : "signup")
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input type="hidden" {...register("teamId")} />
        <Input type="hidden" {...register("session")} />
        <Input type="hidden" {...register("sessionMemberIndex")} />

        {mode === "signup" && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <FaSpinner className="animate-spin" /> : "신청"}
          </Button>
        )}
        {mode === "cancel" && (
          <Dialog
            open={dialogOpen}
            defaultOpen={false}
            onOpenChange={setDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                disabled={isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "탈퇴"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>정말로 탈퇴하시겠습니까?</DialogTitle>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="destructive"
                  onClick={handleSubmit(onSubmit)}
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "ㄹ?ㅇ"
                  )}
                </Button>
              </DialogHeader>
              <DialogDescription>
                선착순으로 모집되기에 탈퇴 시 다른 참가자가 참여할 수 있습니다.
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </form>
    </>
  )
}

interface MemberSessionTableRowProps {
  team: Team
  memberSession: MemberSession
  largestRequiredMemberCount: number
  leader?: User
}

const MemberSessionTableRow = ({
  team,
  memberSession,
  largestRequiredMemberCount,
  leader
}: MemberSessionTableRowProps) => {
  const memberName = (member: User) =>
    member.id === leader?.id ? (
      <>
        {member.name}
        <br />
        (팀장)
      </>
    ) : (
      member.name
    )

  const isOccupied = (index: number, memberSession: MemberSession) =>
    index < memberSession.members.length
  const isApplied = (index: number, memberSession: MemberSession) => {
    // const currentUserId = 1;  // TODO: 나중에 로그인 한 유저로 수정
    // return memberSession.members[index].id === currentUserId
    return index === 1 // 일단은 두번째 유저를 신청한 것으로 가정
  }
  const isMissing = (index: number, memberSession: MemberSession) =>
    index < memberSession.requiredMemberCount

  const cellClassName = "px-1"

  return (
    <TableRow>
      <TableCell className={cellClassName}>
        {memberSession.session}
        <br />({memberSession.members.length}/
        {memberSession.requiredMemberCount})
      </TableCell>
      {Array.from({ length: largestRequiredMemberCount }, (_, index) => (
        <TableCell key={index} className={cellClassName}>
          {isOccupied(index, memberSession) ? (
            isApplied(index, memberSession) ? (
              <SubmitButton
                teamId={team.id}
                session={memberSession.session}
                sessionMemberIndex={index}
                initialMode="cancel"
              />
            ) : (
              memberName(memberSession.members[index])
            )
          ) : isMissing(index, memberSession) ? (
            <SubmitButton
              teamId={team.id}
              session={memberSession.session}
              sessionMemberIndex={index}
              initialMode="signup"
            />
          ) : (
            "X"
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface MemberSessionTableProps {
  team: Team
  memberSessions: MemberSession[]
  leader?: User
}

const MemberSessionTable = ({
  team,
  memberSessions,
  leader
}: MemberSessionTableProps) => {
  const largestRequiredMemberCount = Math.max(
    ...memberSessions.map((memberSession) => memberSession.requiredMemberCount)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>멤버 목록</CardTitle>
      </CardHeader>
      <CardContent className="px-2 lg:px-3">
        <Table className="table-fixed overflow-hidden rounded-t-md border-2 text-center shadow-lg shadow-black">
          <TableHeader>
            <TableRow className="hover:bg-bg-primary bg-primary">
              <TableHead className="w-[76px] text-center text-white">
                세션
              </TableHead>
              {Array.from(
                { length: largestRequiredMemberCount },
                (_, index) => (
                  <TableHead key={index} className="text-center text-white">
                    {index + 1}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberSessions.map((memberSession) => (
              <MemberSessionTableRow
                team={team}
                key={memberSession.id}
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
