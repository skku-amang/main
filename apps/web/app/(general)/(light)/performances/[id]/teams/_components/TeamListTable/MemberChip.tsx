import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"

/**
 * 사람 한 명: (작은 사진) + 이름, 둘 다 그 사람 프로필로. 이름 아래에 children(취소 버튼·배지 등).
 * 표에선 빈자리·내 자리만 눈에 띄어야 해서 이름은 기본 회색, 내 이름만 진하게.
 * 사진은 부원 80%가 자동 생성 아바타라(2026-10 프로덕션) 휴대폰 표에선 뺀다.
 */
const MemberChip = ({
  user,
  showAvatar = true,
  isMe = false,
  children
}: {
  user: { id: number; name: string; image: string | null }
  showAvatar?: boolean
  isMe?: boolean
  children?: React.ReactNode
}) => (
  <div className="flex items-center gap-1.5">
    {showAvatar && (
      // 이름 링크와 같은 곳이라 키보드·화면낭독기에선 건너뜀
      <Link
        href={ROUTES.MEMBER_PROFILE(user.id)}
        tabIndex={-1}
        aria-hidden
        className="shrink-0"
      >
        <Avatar className="size-5">
          <AvatarImage src={user.image ?? undefined} alt="" />
          <AvatarFallback className="text-[10px]">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
    )}
    <div className="flex flex-col items-start gap-1">
      <Link
        href={ROUTES.MEMBER_PROFILE(user.id)}
        className={cn(
          "whitespace-nowrap text-sm hover:underline",
          isMe ? "font-semibold text-primary" : "text-slate-500"
        )}
      >
        {user.name}
      </Link>
      {children}
    </div>
  </div>
)

export default MemberChip
