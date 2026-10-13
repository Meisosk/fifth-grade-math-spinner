import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      // Forward /api calls to the Express server in server/
      proxy: {
        '/api': `http://localhost:${env.PORT || 3001}`,
      },
    },
  }
})
