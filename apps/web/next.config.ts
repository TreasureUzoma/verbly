import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],

  async rewrites() {
    const apiBase =
      process.env.API_BASE ?? "http://localhost:5000/api/v1"

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/:path*`,
      },
    ]
  },
}

export default nextConfig
