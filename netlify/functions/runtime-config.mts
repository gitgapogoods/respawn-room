import type { Config } from '@netlify/functions'

function isValidConvexUrl(value: string | undefined): value is string {
  if (!value) return false

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.convex.cloud')
  } catch {
    return false
  }
}

export default () => {
  const convexUrl = Netlify.env.get('VITE_CONVEX_URL')

  if (!isValidConvexUrl(convexUrl)) {
    return Response.json(
      { error: 'Backend URL is not configured' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }

  return Response.json(
    { convexUrl },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export const config: Config = {
  path: '/api/runtime-config',
  method: 'GET',
}
