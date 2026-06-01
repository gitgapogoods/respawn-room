import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

// This app is built and deployed as a static client-side SPA (entry: index.html
// -> src/main.tsx). The TanStack Start plugin is intentionally not used, since it
// would produce a server build instead of a static `dist/` with an index.html.
export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist/client',
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    viteReact(),
  ],
})
