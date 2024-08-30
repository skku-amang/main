import Image from "next/image"
import Link from "next/link";
import { FaClock } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";

import { Badge } from "../../../../../components/ui/badge";
import ROUTES from "../../../../../constants/routes";
import { generateDummys } from "../../../../../lib/dummy";
import { createPerformance } from "../../../../../lib/dummy/Performance"
import TeamList from "../../teams/page";

interface PerformanceDetailProp {
  params: {
    id: number
  }
}

const PerformanceDetail = ({ params }: PerformanceDetailProp) => {
  const { id } = params
  const performance = createPerformance(id)
  // const rows: TeamColumn[] = performance.teams
  const relatedPerformances = generateDummys(3, createPerformance)

  return (
    <>
      {/* 기본 정보 */}
      <div className="flex">
        {/* 이미지 */}
        <Image
          alt={`${performance.name} 사진`}
          src={performance.representativeImage}
          width={300} height={300}
          className="rounded-lg m-10 shadow-2xl"
          />
        
        {/* 기본 정보 */}
        <div className="w-full p-6">
          <h3 className="text-3xl mb-5">{performance.name}</h3>

          <div className="space-y-3">
            <div className="flex items-center">
              <FaClock />&nbsp;{performance.start_datetime.toLocaleString("ko-KR")} ~ {performance.end_datetime.toLocaleTimeString()}
            </div>
            <div className="flex items-center">
              <IoLocationSharp />&nbsp;{performance.location}
            </div>
          </div>

          <p className="border rounded-xl bg-slate-100 shadow p-5">
            {performance.description}
          </p>
        </div>
      </div>

      {/* 연관 공연 */}
      <div className="flex flex-col justify-center items-center px-10">
        <p className="text-sm mb-2 font-bold">모집 중인 공연</p>
        <div className="flex gap-x-2">
          {relatedPerformances.map(p => (
            <Link key={p.id} href={ROUTES.PERFORMANCE.DETAIL.url(p.id.toString())}>
              <Badge className="p-2 px-3 bg-slate-200 text-black">
                {p.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* 팀 목록 */}
      <div>
        {/* <TeamListDataTable columns={columns} data={rows} /> */}
        <TeamList />
      </div>
    </>
  )
}

export default PerformanceDetail