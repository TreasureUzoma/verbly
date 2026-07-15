import { fetcher } from "@/lib/api/client"
import { useMutation } from "@tanstack/react-query"

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

export const useAuthLogin = () => {
  return useMutation({
    mutationFn: async (payload: GoogleLoginPayload) => {
      const response = await fetcher.post<AuthResponse>("/auth/google", payload)
      return response.data
    },
  })
}
