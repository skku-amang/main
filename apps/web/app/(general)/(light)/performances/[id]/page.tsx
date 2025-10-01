"use client"

import Image from "next/image"
import { FaClock } from "react-icons/fa"
import { IoLocationSharp } from "react-icons/io5"

import { usePerformance } from "@/hooks/api/usePerformance"
import { useParams } from "next/navigation"

const PerformanceDetail = () => {
  const params = useParams()
  const { id } = params

  const { data: performance, status } = usePerformance(Number(id))

  if (status === "pending") {
    return <div>로딩중...</div>
  }

  if (status === "error" || performance === undefined) {
    return <div>오류가 발생했습니다.</div>
  }

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
              {performance.startAt &&
                new Date(performance.startAt).toLocaleString("ko-KR")}{" "}
              ~&nbsp;
              {performance.endAt &&
                new Date(performance.endAt).toLocaleTimeString()}
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
