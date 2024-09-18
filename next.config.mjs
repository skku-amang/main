/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `${
          process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_LOCAL_URL
            : process.env.NEXT_PUBLIC_DEPLOY_URL
        }/api/:path*`
      }
    ]
  }
}

export default nextConfig
