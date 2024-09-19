import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SessionName } from "@/types/Session"
import { User } from "@/types/User"

interface MemberSessionCardProps {
  session: SessionName
  user?: User
}

const MemberSessionCard = ({ session, user }: MemberSessionCardProps) => {
  if (!user) return
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="rounded-t-md bg-secondary px-2 py-1 text-sm font-semibold">
          {session}
        </div>
        <div className="flex-auto" />
      </div>
      <div className="flex items-center justify-start gap-x-8 rounded-lg border-2 border-secondary px-8 py-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>{user.name?.substring(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <div>
            {user.generation?.order}기 {user.name}
          </div>
          <span className="text-sm text-gray-400"># {user.nickname}</span>
        </div>
      </div>
    </div>
  )
}

export default MemberSessionCard
