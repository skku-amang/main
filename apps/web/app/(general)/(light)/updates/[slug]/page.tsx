import { ChevronRight } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import DefaultPageHeader, {
  DefaultHomeIcon
} from "@/components/PageHeaders/Default"
import ROUTES from "@/constants/routes"
import { getUpdate, getUpdates } from "@/lib/updates"

import MarkUpdatesSeen from "../_components/MarkUpdatesSeen"
import UpdateBody from "../_components/UpdateBody"

type Props = { params: Promise<{ slug: string }> }

// 글은 빌드 때 다 정해지므로 없는 주소는 404
export const dynamicParams = false

export function generateStaticParams() {
  return getUpdates().map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const update = getUpdate((await params).slug)
  return { title: update?.title ?? "업데이트 소식" }
}

export default async function UpdateDetailPage({ params }: Props) {
  const update = getUpdate((await params).slug)
  if (!update) notFound()

  return (
    <div>
      <DefaultPageHeader
        title="업데이트 소식"
        routes={[
          { display: <DefaultHomeIcon />, href: ROUTES.HOME },
          { display: "업데이트 소식", href: ROUTES.UPDATES.LIST },
          { display: update.title }
        ]}
      />
      <MarkUpdatesSeen date={update.date} />
      <article className="mx-auto mb-12 max-w-2xl space-y-4 rounded-xl bg-white p-5 shadow-sm md:p-8">
        <header className="space-y-1">
          <p className="text-xs text-slate-400">
            {update.date.replaceAll("-", ".")}
          </p>
          <h2 className="text-xl font-semibold">{update.title}</h2>
        </header>
        <div className="space-y-3 text-sm text-slate-700 md:text-base">
          <UpdateBody body={update.body} />
        </div>
        {update.href && (
          <Link
            href={update.href}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            써 보러 가기
            <ChevronRight className="size-4" />
          </Link>
        )}
      </article>
    </div>
  )
}
