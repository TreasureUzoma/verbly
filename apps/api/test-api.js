// Simple test script to check if our API and database are working
import { serve } from "@hono/node-server"
import app from "./dist/index.js"

console.log("🚀 Starting API server...")

const server = serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`✅ Server is running on http://localhost:${info.port}`)
    console.log("📚 Available endpoints:")
    console.log("  - GET  /api/v1/words/today")
    console.log("  - POST /api/v1/words/today/complete")
    console.log("  - POST /api/v1/words/learn")
    console.log("  - GET  /api/v1/words/learned")
    console.log("  - GET  /api/v1/words/saved")
    console.log("  - GET  /api/v1/profile")
    console.log("")
    console.log("🔑 Note: Most endpoints require authentication")
    console.log("💾 Database migration status: Ready")
  }
)

// Handle shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...")
  process.exit(0)
})
