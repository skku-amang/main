/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // /api/auth를 제외한 모든 /api 요청을 리다이렉트
        source: '/api/:path((?!auth/).+)*',
        destination: `${process.env.NEXT_PUBLIC_DEVELOPMENT_URL}/api/:path*`,
      },
    ]
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
  }
};

export default nextConfig;
