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
        hostname: "amang.net",
        port: "",
        pathname: "/media/**"
      },
      {
        protocol: "https",
        hostname: "amang.net",
        port: "",
        pathname: "/media/**"
      }
    ]
  }
};

export default nextConfig;
