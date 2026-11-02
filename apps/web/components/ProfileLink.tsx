import Link from "next/link"

import ROUTES from "@/constants/routes"
import { HIDDEN_USER_ID } from "@repo/shared-types"

/**
 * 부원 프로필 링크. 피드백 기간에 가린 자리(HIDDEN_USER_ID)는 갈 프로필이 없어 글자만.
 */
const ProfileLink = ({
  userId,
  className,
  tabIndex,
  "aria-hidden": ariaHidden,
  children
}: {
  userId: number
  className?: string
  tabIndex?: number
  "aria-hidden"?: boolean
  children: React.ReactNode
}) =>
  userId === HIDDEN_USER_ID ? (
    <span className={className} aria-hidden={ariaHidden}>
      {children}
    </span>
  ) : (
    <Link
      href={ROUTES.MEMBER_PROFILE(userId)}
      className={className}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
    >
      {children}
    </Link>
  )

export default ProfileLink
