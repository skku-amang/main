import type { MetadataRoute } from "next"

import { SEO } from "@/constants/seo"
import { apiClient } from "@/lib/apiClient"

export const dynamic = "force-dynamic"

const BASE_URL = SEO.SITE_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0
    },
    {
      url: `${BASE_URL}/performances`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${BASE_URL}/members`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${BASE_URL}/notices`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6
    },
    {
      url: `${BASE_URL}/reservations/clubroom`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.4
    },
    {
      url: `${BASE_URL}/reservations/equipment`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.4
    }
  ]

  let performancePages: MetadataRoute.Sitemap = []
  try {
    const performances = await apiClient.getPerformances()
    performancePages = performances.map((p) => ({
      url: `${BASE_URL}/performances/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  } catch {
    // API 서버 접근 불가 시 정적 페이지만 반환
  }

  return [...staticPages, ...performancePages]
}
