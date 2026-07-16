import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],

  async rewrites() {
    try {
      const { env } = await import("./env")
      return [
        {
          source: "/api/:path*",
          destination: `${env.API_BASE}/:path*`,
        },
      ]
    } catch {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/api/v1/:path*",
        },
      ]
    }
  },
}

export default nextConfig
