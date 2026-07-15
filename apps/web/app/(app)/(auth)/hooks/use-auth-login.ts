import { useMutation } from "@tanstack/react-query"
import axios from "axios"

interface GoogleLoginPayload {
  token: string
}

interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
  }
  accessToken: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const authApi = axios.create({
  baseURL: API_BASE,
})

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: async (payload: GoogleLoginPayload) => {
      const response = await authApi.post<AuthResponse>("/auth/google", payload)
      return response.data
    },
  })
}
