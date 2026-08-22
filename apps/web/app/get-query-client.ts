import { toast } from "@/components/hooks/use-toast"
import { UpstreamError } from "@repo/api-client"
import {
  MutationCache,
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer
} from "@tanstack/react-query"

function notifyUpstreamError(error: unknown) {
  if (isServer || !(error instanceof UpstreamError)) return

  toast({
    variant: "destructive",
    title: "서버와 연결하지 못했습니다",
    description: "잠시 후 다시 시도해 주세요."
  })
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: notifyUpstreamError }),
    mutationCache: new MutationCache({ onError: notifyUpstreamError }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending"
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
