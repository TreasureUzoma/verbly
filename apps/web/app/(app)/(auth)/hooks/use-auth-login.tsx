import { fetcher } from "@/lib/api/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useAuthLogin = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const response = await fetcher.post<{ url: string }>("/auth/google/url")
      router.push(response.data.url)
    },
  })
}
