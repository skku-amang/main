'use client'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IoLocationSharp } from "react-icons/io5";
import Image from "next/image"
import Link from "next/link"
import ROUTES from "../../../constants/routes"

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

export default PerformanceCard