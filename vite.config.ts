import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH lo define el workflow de GitHub Pages (/nombre-del-repo/). En local queda en '/'.
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}

export default defineConfig({
  base: env.BASE_PATH ?? '/',
  plugins: [react()],
})
