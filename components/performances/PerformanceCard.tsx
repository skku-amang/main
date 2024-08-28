'use client'

import Image from "next/image"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "../../lib/utils";

import ROUTES from "../../constants/routes"

interface PerformanceCardProp {
  id?: number
  name: string
  representativeSrc: string
  description?: string
  location: string
  startDatetime: Date
  endDatetime: Date
  className?: string
}

const RepresentativeImage = ({ alt, src, width, height }: { alt: string, src: string, width: number, height: number}) => {
  return <Image alt={alt} src={src} width={width} height={height} className="overflow-hidden" />
}

const PerformanceCard = ({ id, name, representativeSrc, description, location, startDatetime, endDatetime, className }: PerformanceCardProp) => {
  const width = 300
  const height = 200

  return (
    <Card style={{ width }} className={cn("overflow-hidden", className)}>
      {id ?
        <Link href={ROUTES.PERFORMANCE.DETAIL.url(id.toString())}>
          <RepresentativeImage alt={`${name} 이미지`} src={representativeSrc} width={width} height={height} />
        </Link>
        :
        <RepresentativeImage alt={`${name} 이미지`} src={representativeSrc} width={width} height={height} />
      }

      <CardHeader className="pb-0">
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {`${startDatetime.getFullYear()}년 ${startDatetime.getMonth()}월 ${startDatetime.getDate()}일`}
        </CardDescription>
      </CardHeader>

      {description &&
        <CardContent className="truncate">
          {description}
        </CardContent>
      }

      <CardFooter className="flex text-slate-400 text-sm">
        <IoLocationSharp />&nbsp;
        <p>{location}</p>
      </CardFooter>
    </Card>
  )
}

export default PerformanceCard