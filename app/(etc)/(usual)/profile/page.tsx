import { auth } from '../../../../auth'

const ProfilePage = async () => {
  const session = await auth()

  if (!session) {
    return (
      <div>
        <h1>마이 페이지</h1>
        <p>로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>프로필 페이지</h1>

      <div>
        <h3>로그인된 유저 확인</h3>

        <p>{session.user?.email}</p>
        <p>{session.user?.name}</p>
      </div>
    </div>
  )
}

export default ProfilePage
