"use client"

import Image from "next/image"
import { FaClock } from "react-icons/fa"
import { IoLocationSharp } from "react-icons/io5"

import { usePerformance } from "@/hooks/api/usePerformance"
import { useParams } from "next/navigation"

const PerformanceDetail = () => {
  const params = useParams()
  const { id } = params

  const { data: performance } = usePerformance(Number(id))

  return (
    <>
      {/* 기본 정보 */}
      <div className="flex">
        {/* 이미지 */}
        <Image
          alt={`${performance.name} 사진`}
          src={performance.posterImage ?? "/images/default.jpg"}
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
              &nbsp;
              {new Date(performance.startDatetime).toLocaleString(
                "ko-KR"
              )} ~ {new Date(performance.endDatetime).toLocaleTimeString()}
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
    </>
  )
}

export default PerformanceDetail
