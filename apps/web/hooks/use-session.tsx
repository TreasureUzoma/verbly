import { fetcher } from "@/lib/api/client"
import { SessionData } from "@/types/auth"
import { useQuery } from "@tanstack/react-query"

export const useGetSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const response = await fetcher.get<SessionData>("/session")
      return response.data
    },
  })
}
