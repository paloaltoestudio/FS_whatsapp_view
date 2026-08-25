import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ultra-lightweight build target for WhatsApp in-app browsers (older WebKit/Chrome webviews).
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2018',
    cssCodeSplit: false,
  },
})
