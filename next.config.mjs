/** @type {import('next').NextConfig} */
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
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: `${process.env.NEXT_PUBLIC_DEPLOY_URL || process.env.NEXT_PUBLIC_DEVELOPMENT_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
