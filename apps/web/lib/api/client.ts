import { env } from "@/env"
import axios from "axios"

export const fetcher = axios.create({
  baseURL: env.API_BASE,
})
