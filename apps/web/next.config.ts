import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],

  async rewrites() {
    const apiBase =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/v1"
        : (process.env.API_BASE ?? "http://localhost:5000/api/v1")

    return [
      {
        source: "/api-proxied/:path*",
        destination: `${apiBase}/:path*`,
      },
    ]
  },
}

export default nextConfig
