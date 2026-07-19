import "server-only"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"

type NextFetchOptions = RequestInit & {
  next?: NextFetchRequestConfig
  cache?: RequestCache
  params?: Record<string, string | number | boolean | undefined>
  json?: any
  tags?: string[]
  revalidate?: number | false
}

export async function api<T>(
  endpoint: string,
  options: NextFetchOptions = {}
): Promise<T> {
  const { params, json, headers, tags, revalidate, ...rest } = options

  const baseUrl = process.env.API_BASE
  const url = new URL(`${baseUrl}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value))
    })
  }

  const cookieStore = await cookies()

  const accessToken = cookieStore.get("verblyAccessToken")?.value || ""
  const refreshToken = cookieStore.get("verblyRefreshToken")?.value || ""

  const config: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      // Forward tokens upstream to Hono via headers
      "x-access-token": accessToken,
      "x-refresh-token": refreshToken,
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
    next: {
      tags: tags ?? rest.next?.tags,
      revalidate: revalidate ?? rest.next?.revalidate,
    },
  }

  const response = await fetch(url.toString(), config)

  const incomingAccess = response.headers.get("x-access-token")
  if (response.status === 204) return {} as T

  const rawBody = await response.json().catch(() => ({}))
  const responseBody =
    rawBody && typeof rawBody === "object" && "data" in rawBody
      ? (rawBody as any).data
      : rawBody

  console.log("response body:", responseBody)

  if (!response.ok) {
    console.log(rawBody)
    throw new Error(rawBody.message || `API Error: ${response.status}`)
  }

  const incomingRefresh = response.headers.get("x-refresh-token")

  if (incomingAccess) {
    cookieStore.set("verblyAccessToken", incomingAccess, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    })
  }

  if (incomingRefresh) {
    cookieStore.set("verblyRefreshToken", incomingRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    })
  }

  return responseBody as T
}

api.get = <T>(url: string, opts?: NextFetchOptions) =>
  api<T>(url, { ...opts, method: "GET" })
api.post = <T>(url: string, body: any, opts?: NextFetchOptions) =>
  api<T>(url, { ...opts, method: "POST", json: body })
api.patch = <T>(url: string, body: any, opts?: NextFetchOptions) =>
  api<T>(url, { ...opts, method: "PATCH", json: body })
api.put = <T>(url: string, body: any, opts?: NextFetchOptions) =>
  api<T>(url, { ...opts, method: "PUT", json: body })
api.delete = <T>(url: string, opts?: NextFetchOptions) =>
  api<T>(url, { ...opts, method: "DELETE" })

export const invalidate = (...tags: string[]) => {
  tags.forEach((tag) => revalidateTag(tag, "max"))
}
