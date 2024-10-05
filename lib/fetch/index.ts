import { RequestInit } from "next/dist/server/web/spec-extension/request"

import { ApiEndpoint } from "@/constants/apiEndpoints"

export default async function fetchData(
  apiEndpoint: ApiEndpoint,
  init?: RequestInit
) {
  const { url, method } = apiEndpoint

  return fetch(url as string, {
    ...init,
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY as string,
      ...init?.headers
    }
  })
}
