import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** 부원 프로필 사진. 사진이 없으면 이름 첫 글자 */
const UserAvatar = ({
  user,
  className
}: {
  user: { name: string; image?: string | null }
  className?: string
}) => (
  <Avatar className={cn("size-6", className)}>
    <AvatarImage src={user.image ?? undefined} alt="" />
    <AvatarFallback className="text-[10px]">{user.name[0]}</AvatarFallback>
  </Avatar>
)

export default UserAvatar
