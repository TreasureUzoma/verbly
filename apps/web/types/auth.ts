export type SessionData = {
  id: string
  email: string
  name: string
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}
