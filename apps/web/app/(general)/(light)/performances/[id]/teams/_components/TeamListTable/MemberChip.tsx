import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ROUTES from "@/constants/routes"

/** 프로필 사진 + 이름. 둘 다 그 사람 프로필로 가고, 이름 아래에 children(취소 버튼·배지 등)을 둔다 */
const MemberChip = ({
  user,
  children
}: {
  user: { id: number; name: string; image: string | null }
  children?: React.ReactNode
}) => (
  <div className="flex items-center gap-2">
    {/* 이름 링크와 같은 곳이라 키보드·화면낭독기에선 건너뜀 */}
    <Link
      href={ROUTES.MEMBER_PROFILE(user.id)}
      tabIndex={-1}
      aria-hidden
      className="shrink-0"
    >
      <Avatar className="size-7">
        <AvatarImage src={user.image ?? undefined} alt="" />
        <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
      </Avatar>
    </Link>
    <div className="flex flex-col items-start gap-1">
      <Link
        href={ROUTES.MEMBER_PROFILE(user.id)}
        className="whitespace-nowrap text-sm text-slate-700 hover:underline"
      >
        {user.name}
      </Link>
      {children}
    </div>
  </div>
)

export default MemberChip
