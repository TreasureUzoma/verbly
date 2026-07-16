import axios from "axios"

export const fetcher = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
})

// Unwrap API responses to return just the data
fetcher.interceptors.response.use((response) => {
  if (response.data?.data !== undefined) {
    response.data = response.data.data
  }
  return response
})
