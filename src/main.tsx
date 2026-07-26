import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles/app.css'

function isValidConvexUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.convex.cloud')
  } catch {
    return false
  }
}

async function resolveConvexUrl() {
  try {
    const response = await fetch('/api/runtime-config', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (response.ok) {
      const config: unknown = await response.json()
      if (
        typeof config === 'object' &&
        config !== null &&
        'convexUrl' in config &&
        isValidConvexUrl(config.convexUrl)
      ) {
        return config.convexUrl
      }
    }
  } catch {
    // Local Vite runs do not include Netlify Functions, so use the build value.
  }

  const buildTimeUrl = import.meta.env.VITE_CONVEX_URL
  if (!isValidConvexUrl(buildTimeUrl)) {
    throw new Error('The backend URL is not configured correctly.')
  }

  return buildTimeUrl
}

function renderStartupError(error: unknown) {
  const message =
    error instanceof Error ? error.message : 'The game server is unavailable.'

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <main className="min-h-screen bg-dark-bg bg-grid-pattern flex items-center justify-center px-6">
      <section className="max-w-xl rounded-3xl border border-neon-pink/30 bg-black/80 p-10 text-center">
        <h1 className="mb-4 font-orbitron text-3xl text-white">
          Unable to connect to the game server
        </h1>
        <p className="mb-8 text-gray-400">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-neon-cyan/40 px-5 py-3 font-orbitron text-sm uppercase tracking-wider text-neon-cyan"
        >
          Retry connection
        </button>
      </section>
    </main>,
  )
}

async function startApp() {
  const convexUrl = await resolveConvexUrl()
  const router = getRouter(convexUrl)

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}

void startApp().catch(renderStartupError)
