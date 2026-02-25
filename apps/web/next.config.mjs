/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
  output: "standalone"
}

export default nextConfig
