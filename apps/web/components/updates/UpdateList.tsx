"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import ROUTES from "@/constants/routes"
import type { UpdatePreview } from "@/lib/updates"
import { readUpdatesSeenAt } from "@/lib/updatesSeen"

const formatDate = (date: string) => date.replaceAll("-", ".")

const UpdateList = ({ updates }: { updates: UpdatePreview[] }) => {
  // 저장소는 브라우저에만 있으니 그린 뒤에 읽는다 (서버 HTML과 어긋나지 않게)
  const [seenAt, setSeenAt] = useState<string | null | undefined>(undefined)
  useEffect(() => setSeenAt(readUpdatesSeenAt()), [])

  return (
    <ul className="space-y-2">
      {updates.map((u) => {
        const isNew = seenAt !== undefined && u.date > (seenAt ?? "")
        return (
          <li key={u.slug}>
            <Link
              href={ROUTES.UPDATES.DETAIL(u.slug)}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="flex items-center gap-2 font-semibold">
                  <span className="truncate">{u.title}</span>
                  {isNew && (
                    <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      새 글
                    </span>
                  )}
                </p>
                <p className="line-clamp-1 text-sm text-slate-600">
                  {u.summary}
                </p>
                <p className="text-xs text-slate-500">{formatDate(u.date)}</p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-slate-400" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default UpdateList
