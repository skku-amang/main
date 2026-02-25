import type { MetadataRoute } from "next"

import { SEO } from "@/constants/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login", "/signup", "/profile/", "/api/"]
      }
    ],
    sitemap: `${SEO.SITE_URL}/sitemap.xml`
  }
}
