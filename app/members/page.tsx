import { columns } from "@/app/members/_components/MemberListTable/columns"
import { MemberListDataTable } from "@/app/members/_components/MemberListTable/data-table"

const MemberListPage = () => {
  return (
    <div className="container">
      {/* 팀 배너 */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="mt-24 text-4xl font-extrabold text-gray-600">
          부원 목록
        </h2>
        <p className="my-8 font-bold">Member List</p>
      </div>

      {/* 팀 목록 테이블 */}
      <MemberListDataTable columns={columns} data={[]} />
    </div>
  )
}

export default MemberListPage
