import axios from "axios"
import { env } from "@/env"

export const fetcher = axios.create({
  baseURL:
    env.NEXT_PUBLIC_API_BASE ||
    env.API_BASE ||
    "https://verbly-api.vercel.app/api/v1",
  withCredentials: true,
})

// Unwrap API responses to return just the data
fetcher.interceptors.response.use((response) => {
  if (response.data?.data !== undefined) {
    response.data = response.data.data
  }
  return response
})
