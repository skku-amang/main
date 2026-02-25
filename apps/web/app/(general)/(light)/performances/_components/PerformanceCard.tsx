"use client"

import Image from "next/image"
import Link from "next/link"
import { IoLocationSharp } from "react-icons/io5"
import { LuMusic } from "react-icons/lu"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import ROUTES from "@/constants/routes"
import { cn } from "@/lib/utils"

interface PerformanceCardProp {
  id?: number
  name: string
  posterSrc: string | null
  description?: string
  location: string | null
  startAt: Date | null
  className?: string
}

const PosterImage = ({ alt, src }: { alt: string; src?: string }) => {
  if (!src) {
    return (
      <div className="flex aspect-[3/2] w-full items-center justify-center bg-slate-100">
        <LuMusic className="size-12 text-slate-300" />
      </div>
    )
  }

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden">
      <Image alt={alt} src={src} fill className="object-cover" />
    </div>
  )
}

const PerformanceCard = ({
  id,
  name,
  posterSrc,
  description,
  location,
  startAt,
  className
}: PerformanceCardProp) => {
  const image = (
    <PosterImage alt={`${name} 이미지`} src={posterSrc || undefined} />
  )

  const card = (
    <Card
      className={cn(
        "overflow-hidden transition-shadow duration-200 hover:shadow-lg",
        className
      )}
    >
      {image}

      <CardHeader className="pb-0">
        <CardTitle className="truncate">{name}</CardTitle>
        <CardDescription>
          {startAt
            ? `${startAt.getFullYear()}년 ${startAt.getMonth() + 1}월 ${startAt.getDate()}일`
            : "미정"}
        </CardDescription>
      </CardHeader>

      {description && (
        <CardContent className="truncate">{description}</CardContent>
      )}

      <CardFooter className="flex text-sm text-slate-400">
        <IoLocationSharp />
        &nbsp;
        <p>{location}</p>
      </CardFooter>
    </Card>
  )

  if (id) {
    return <Link href={ROUTES.PERFORMANCE.DETAIL(id)}>{card}</Link>
  }

  return card
}

export default PerformanceCard
