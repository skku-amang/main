import Image from 'next/image'
import Link from 'next/link'
import { FaClock } from 'react-icons/fa'
import { IoLocationSharp } from 'react-icons/io5'

import { Badge } from '../../../../components/ui/badge'
import ROUTES from '../../../../constants/routes'
import { generateDummys } from '../../../../lib/dummy'
import { createPerformance } from '../../../../lib/dummy/Performance'
import TeamList from '../../teams/page'

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
          width={300}
          height={300}
          className="m-10 rounded-lg shadow-2xl"
        />

        {/* 기본 정보 */}
        <div className="w-full p-6">
          <h3 className="mb-5 text-3xl">{performance.name}</h3>

          <div className="space-y-3">
            <div className="flex items-center">
              <FaClock />
              &nbsp;{performance.start_datetime.toLocaleString('ko-KR')} ~{' '}
              {performance.end_datetime.toLocaleTimeString()}
            </div>
            <div className="flex items-center">
              <IoLocationSharp />
              &nbsp;{performance.location}
            </div>
          </div>

          <p className="rounded-xl border bg-slate-100 p-5 shadow">
            {performance.description}
          </p>
        </div>
      </div>

      {/* 연관 공연 */}
      <div className="flex flex-col items-center justify-center px-10">
        <p className="mb-2 text-sm font-bold">모집 중인 공연</p>
        <div className="flex gap-x-2">
          {relatedPerformances.map((p) => (
            <Link
              key={p.id}
              href={ROUTES.PERFORMANCE.DETAIL.url(p.id.toString())}
            >
              <Badge className="bg-slate-200 p-2 px-3 text-black">
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
