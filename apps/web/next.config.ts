import type { NextConfig } from "next"
const API_BASE = process.env.API_BASE || "https://verbly-api.vercel.app/api/v1"
console.log(API_BASE)

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/api-proxied",
        destination: API_BASE,
      },
      {
        source: "/api-proxied/:path+",
        destination: `${API_BASE}/:path+`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api-proxied/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_API_BASE || API_BASE,
          },
        ],
      },
    ]
  },
}

export default nextConfig
