import type { Metadata } from "next"

import { SEO } from "@/constants/seo"
import { apiClient } from "@/lib/apiClient"

import PerformanceDetailClient from "./_components/PerformanceDetailClient"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const performance = await apiClient.getPerformanceById(Number(id))
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
        images: performance.posterImage
          ? [{ url: performance.posterImage, alt: title }]
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
