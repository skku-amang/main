import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'

import { auth, signOut } from '../../../auth'
import ROUTES from '../../../constants/routes'

const Profile = async () => {
  const session = await auth()

  if (!session) {
    return (
      <div className="flex justify-center gap-x-5 font-bold text-gray-700">
        <Link href={ROUTES.LOGIN.url}>로그인</Link>|<Link href={ROUTES.SIGNUP.url}>회원가입</Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-x-3">
    <Link href="/profile" className="flex items-center justify-center gap-x-3">
      <Avatar>
        <AvatarImage src={session.user?.image} />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      {session.user?.email}
    </Link>
    <form action={async () => {
      'use server'
      await signOut()}}>
      <button type="submit">로그아웃</button>
    </form>
    </div>
  )
}

export default Profile
