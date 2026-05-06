import type { Metadata } from "next"

import { SEO } from "@/constants/seo"
import { ApiSdk } from "@repo/api-client"
import "@repo/api-client/spec-client"

import PerformanceDetailClient from "./_components/PerformanceDetailClient"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    // Spec-derived SDK: 서버 컴포넌트에서 직접 호출 (RSC fetch).
    const { data: performance } = await ApiSdk.getPerformanceById({
      path: { id: Number(id) },
      throwOnError: true
    })
    const title = performance.name
    const description =
      performance.description || `${performance.name} - AMANG 공연 정보`

    return {
      title,
      description,
      alternates: { canonical: `/performances/${id}` },
      openGraph: {
        title: `${title} | AMANG`,
        description,
        images: performance.image
          ? [{ url: performance.image, alt: title }]
          : [{ url: SEO.DEFAULT_OG_IMAGE, alt: SEO.SITE_NAME }]
      }
    }
  } catch {
    return { title: "공연 정보" }
  }
}

export default function PerformanceDetailPage() {
  return <PerformanceDetailClient />
}
