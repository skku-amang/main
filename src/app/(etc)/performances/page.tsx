import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Performance } from "../../../../types/Performance"
import { createPerformance } from "@/lib/dummy/Performance"
import { generateDummys } from "@/lib/dummy"
import Image from "next/image"
import ROUTES from "../../../../constants/routes"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5";

interface PerformanceCardProp {
  id: number
  name: string
  representativeSrc: string
  location: string
  startDatetime: Date
  endDatetime: Date
}

const PerformanceCard = ({ id, name, representativeSrc, location, startDatetime, endDatetime }: PerformanceCardProp) => {
  const width = 300
  return (
    <Card style={{ width }} className="overflow-hidden">
      <Link href={ROUTES.PERFORMANCE.DETAIL.index.url(id.toString())}>
        <Image alt={`${name} 이미지`} src={representativeSrc} width={width} height={200} />
      </Link>

      <CardHeader className="pb-0">
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {`${startDatetime.getFullYear()}년 ${startDatetime.getMonth()}월 ${startDatetime.getDate()}일`}<br/>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex text-slate-400 text-sm">
        <IoLocationSharp />&nbsp;
        <p>{location}</p>
      </CardFooter>
    </Card>
  )
}

const PerformanceList = () => {
  const performances = generateDummys(10, createPerformance)

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {performances.map((p) => (
          <div key={p.id} className="w-full flex justify-center">
            <PerformanceCard
              id={p.id}
              name={p.name}
              representativeSrc={p.representativeImage}
              location={p.location}
              startDatetime={p.start_datetime}
              endDatetime={p.end_datetime}
              />
            </div>
        ))}
      </div>
    </div>
  )
}

export default PerformanceList