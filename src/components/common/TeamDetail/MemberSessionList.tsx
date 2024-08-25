import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { MemberSession } from "../../../../types/Team"
import { User } from "../../../../types/User"

const MemberSessionDetail = ({ member, isLeader }: { member: User, isLeader: boolean }) => {
  return (
    <div>
      <div>
        <h3>{member.name}{isLeader && "(팀장)"}</h3>
        {/* <p>{member.bio}</p> */}
      </div>
      <div>
        {member.sessions.map((session) => (
          <span key={session.id}>{session.name}</span>
        ))}
      </div>
    </div>
  )
}

interface MemberSessionListProps {
  memberSessions: MemberSession[]
  leader: User
}

const MemberSessionList = ({ memberSessions, leader }: MemberSessionListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          멤버 목록
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="flex-col">
          {memberSessions.map((memberSession) => (
            memberSession.members.map((member) => (
              <MemberSessionDetail key={member.id} member={member} isLeader={leader.id === member.id} />
            ))))}
          </CardDescription>
      </CardContent>
      <CardFooter>
        <CardDescription>ㅇㅇㅇ</CardDescription>
      </CardFooter>
    </Card>
  )
}

export default MemberSessionList