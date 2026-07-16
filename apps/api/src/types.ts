export interface AuthType {
  id: string
  email: string
  name?: string
}

export type AppBindings = {
  Variables: {
    user: AuthType
  }
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
}
