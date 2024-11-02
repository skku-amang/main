/** @type {import('next').NextConfig} */
const baseURL = process.env.NODE_ENV === "development" ?
process.env.NEXT_PUBLIC_DEVELOPMENT_URL : process.env.NEXT_PUBLIC_DEPLOY_URL;

if (!baseURL) {
  throw new Error("Base URL is not defined. Please set NEXT_PUBLIC_DEVELOPMENT_URL and NEXT_PUBLIC_DEPLOY_URL in your .env file.");
}

const nextConfig = {
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
      }
    ]
  },
  async rewrites() {
    return [
      // api/auth 경로는 프록시하지 않음
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: "/api/:path*",
        destination: baseURL + "/api/:path*",
      },
    ];
  },
}

export default nextConfig
