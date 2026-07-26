import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { Loader2, RefreshCw, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { routeTree } from './routeTree.gen'
import type { ReactNode } from 'react'

const CONNECTION_TIMEOUT_MS = 10_000

function BackendConnectionGate({ children }: { children: ReactNode }) {
  const { isLoading } = useConvexAuth()
  const [connectionTimedOut, setConnectionTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setConnectionTimedOut(false)
      return
    }

    const timeout = window.setTimeout(
      () => setConnectionTimedOut(true),
      CONNECTION_TIMEOUT_MS,
    )
    return () => window.clearTimeout(timeout)
  }, [isLoading])

  if (connectionTimedOut) {
    return (
      <main className="min-h-screen bg-dark-bg bg-grid-pattern flex items-center justify-center px-6">
        <section className="max-w-xl rounded-3xl border border-neon-pink/30 bg-black/80 p-10 text-center shadow-2xl backdrop-blur-xl">
          <WifiOff className="mx-auto mb-6 h-14 w-14 text-neon-pink" />
          <p className="mb-3 font-orbitron text-xs font-black uppercase tracking-[0.3em] text-neon-pink">
            Connection interrupted
          </p>
          <h1 className="mb-4 font-orbitron text-3xl text-white">
            The game server is unavailable
          </h1>
          <p className="mb-8 text-gray-400">
            The website loaded, but it could not reach the backend. Try again in
            a moment. If this continues, the backend deployment needs attention.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-6 py-3 font-orbitron text-sm font-bold uppercase tracking-wider text-neon-cyan transition-colors hover:bg-neon-cyan/20"
          >
            <RefreshCw className="h-4 w-4" />
            Retry connection
          </button>
        </section>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex items-center gap-3 font-orbitron text-sm uppercase tracking-widest text-neon-cyan">
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting to game server
        </div>
      </main>
    )
  }

  return children
}

function RouterError({ error }: { error: Error }) {
  return (
    <main className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
      <section className="max-w-xl rounded-3xl border border-neon-pink/30 bg-black/80 p-10 text-center">
        <WifiOff className="mx-auto mb-5 h-12 w-12 text-neon-pink" />
        <h1 className="mb-3 font-orbitron text-2xl text-white">
          Unable to load this screen
        </h1>
        <p className="mb-7 text-gray-400">
          {error.message || 'The backend did not return a valid response.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-neon-cyan/40 px-5 py-3 font-orbitron text-sm uppercase tracking-wider text-neon-cyan"
        >
          Try again
        </button>
      </section>
    </main>
  )
}

export function getRouter() {
  const convexUrl = (import.meta as any).env.VITE_CONVEX_URL
  if (!convexUrl) {
    throw new Error('VITE_CONVEX_URL is not configured')
  }
  const convexQueryClient = new ConvexQueryClient(convexUrl)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
        retry: 2,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0, // Let React Query handle all caching
      defaultErrorComponent: ({ error }) => <RouterError error={error} />,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexAuthProvider client={convexQueryClient.convexClient}>
          <BackendConnectionGate>{children}</BackendConnectionGate>
        </ConvexAuthProvider>
      ),
    }),
    queryClient,
  )

  return router
}
