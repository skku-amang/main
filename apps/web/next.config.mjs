import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    lockDistDir: false
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "amang.skku.edu",
        port: "",
        pathname: "/media/**"
      },
      {
        protocol: "https",
        hostname: "amang.skku.edu",
        port: "",
        pathname: "/media/**"
      }
    ],
    unoptimized: true
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains"
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()"
      },
      // 전체 CSP(script-src 등)는 Sentry·next-auth·인라인과 충돌 위험 → 후속 이슈에서 Report-Only로 도입.
      // 지금은 클릭재킹 방어(frame-ancestors)만 안전하게 적용.
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'" }
    ]
    return [{ source: "/:path*", headers: securityHeaders }]
  }
}

export default withSentryConfig(nextConfig, {
  org: "amang-23",
  project: "web",
  silent: !process.env.CI
})
