import { ChevronRight } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { getUpdates } from "@/lib/updates"

import MarkUpdatesSeen from "./_components/MarkUpdatesSeen"
import UpdateBody from "./_components/UpdateBody"

export const metadata: Metadata = {
  title: "업데이트 소식"
}

export default function UpdatesPage() {
  const updates = getUpdates()

  return (
    <div>
      <DefaultPageHeader
        title="업데이트 소식"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "업데이트 소식" }
        ]}
      />
      {updates[0] && <MarkUpdatesSeen latest={updates[0].date} />}
      <div className="mx-auto max-w-2xl space-y-6 pb-12">
        {updates.map((u) => (
          <article
            key={u.slug}
            id={u.slug}
            className="scroll-mt-24 space-y-3 rounded-xl bg-white p-5 shadow-sm"
          >
            <header className="space-y-1">
              <p className="text-xs text-slate-400">
                {u.date.replaceAll("-", ".")}
              </p>
              <h2 className="text-lg font-semibold">{u.title}</h2>
            </header>
            <div className="space-y-3 text-sm text-slate-700">
              <UpdateBody body={u.body} />
            </div>
            {u.href && (
              <Link
                href={u.href}
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                써 보러 가기
                <ChevronRight className="size-4" />
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
