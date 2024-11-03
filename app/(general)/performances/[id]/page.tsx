import { redirect } from "next/dist/client/components/redirect"
import Image from "next/image"
import { FaClock } from "react-icons/fa"
import { IoLocationSharp } from "react-icons/io5"

import { auth } from "@/auth"
import API_ENDPOINTS, { ApiEndpoint } from "@/constants/apiEndpoints"
import ROUTES from "@/constants/routes"
import fetchData from "@/lib/fetch"

interface PerformanceDetailProp {
  params: {
    id: number
  }
}

const PerformanceDetail = async ({ params }: PerformanceDetailProp) => {
  const { id } = params
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)

  const res = await fetchData(
    API_ENDPOINTS.PERFORMANCE.RETRIEVE(id) as ApiEndpoint,
    {
      cache: "no-cache",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${session.access}`
      }
    }
  )
  const performance = await res.json()

  return (
    <>
      {/* 기본 정보 */}
      <div className="flex">
        {/* 이미지 */}
        <Image
          alt={`${performance.name} 사진`}
          src={performance.representativeImage ?? "/images/default.jpg"}
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
