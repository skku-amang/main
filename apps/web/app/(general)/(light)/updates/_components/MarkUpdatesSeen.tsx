"use client"

import { useEffect } from "react"

import { markUpdatesSeen } from "@/lib/updatesSeen"

/** 글을 읽으면 그 날짜까지의 "New" 표시를 지운다 */
export default function MarkUpdatesSeen({ date }: { date: string }) {
  useEffect(() => markUpdatesSeen(date), [date])
  return null
}
