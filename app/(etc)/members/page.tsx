import { columns } from "@/components/MemberListTable/columns"
import { MemberListDataTable } from "@/components/MemberListTable/data-table"
import { generateDummys } from "@/lib/dummy"
import { createUser } from "@/lib/dummy/User"
import { User } from "@/types/User"

const USERS = generateDummys(45, createUser)
const rows: User[] = USERS.map((user) => ({
  id: user.id,
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  bio: user.bio,
  profile_image: user.profile_image,
  generation: user.generation,
  sessions: user.sessions,
  genre: user.genre,
  liked_artists: user.liked_artists
}))

const MemberListPage = () => {
  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-4xl font-extrabold text-gray-600 mt-24">부원 목록</h2>
        <p className="my-8 font-bold">Member List</p>
      </div>

      {/* 팀 목록 테이블 */}
      <MemberListDataTable columns={columns} data={rows} />
    </div>
  )
}

export default MemberListPage