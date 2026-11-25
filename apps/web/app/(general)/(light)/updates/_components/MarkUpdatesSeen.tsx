"use client"

import { useEffect } from "react"

import { markUpdatesSeen } from "@/lib/updatesSeen"

/** 전체 목록을 열면 홈 카드의 "새로" 표시를 지운다 */
export default function MarkUpdatesSeen({ latest }: { latest: string }) {
  useEffect(() => markUpdatesSeen(latest), [latest])
  return null
}
