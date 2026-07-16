import type { NextConfig } from "next"
import { env } from "./env"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${env.NEXT_PUBLIC_API_BASE}/:path*`,
      },
    ]
  },
}

export default nextConfig
