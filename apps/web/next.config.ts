import type { NextConfig } from "next"
const API_BASE = process.env.API_BASE || "https://verbly-api.vercel.app/api/v1"

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
}

export default nextConfig
