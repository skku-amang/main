import { UserListDataTable } from "@/components/UserListTable/data-table"
import { columns } from "@/components/UserListTable/columns"
import { generateDummys } from "@/lib/dummy"
import { createTeam } from "@/lib/dummy/Team"
import { createPerformance } from "@/lib/dummy/Performance"
import { Badge } from "@/components/ui/badge"
import ROUTES from "../../../../constants/routes"
import Link from "next/link"
import { createUser } from "@/lib/dummy/User"
import { User } from "../../../../types/User"

const USERS = generateDummys(45, createUser)
const rows: User[] = USERS.map((user) => ({
  id: user.id,
  name: user.name,
  nickname: user.nickname,
  email: user.email,
  bio: user.bio,
  profile_image: user.profile_image,
  generation: user.generation,
  sessions: user.sessions
}))

// TODO: column visible 선택 기능 -> 세션별 지원자 확인 할 수 있게
// TODO: 검색 기준을 곡명이 아니라 모든 것으로 확장
// TODO: column 너비 조절
// TODO: 필터 -> Dialog로 처리
// TODO: Pagination에서 1,2,3,4,5 등 추가
// TODO: Primary, Secondary 색상 설정
const TeamList = () => {
  const activePerformances = generateDummys(3, createPerformance)

  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-4xl font-extrabold text-gray-600 mt-24">부원 목록</h2>
        <p className="my-8 font-bold">Member List</p>
      </div>

      {/* 팀 목록 테이블 */}
      <UserListDataTable columns={columns} data={rows} />
    </div>
  )
}

export default TeamList