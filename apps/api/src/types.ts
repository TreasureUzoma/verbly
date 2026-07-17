export interface AuthType {
  id: string
  email: string
  name?: string
}

// Full user type from database
export interface UserType {
  id: string
  providerId: string | null
  name: string
  username: string | null
  email: string
  password: string | null
  emailVerifiedAt: Date | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
  authMethod: "email" | "google" | null
  status: "active" | "suspended" | "read-only" | null
  role: "user" | "admin" | null
  subscriptionType: "free" | "pro" | null
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
