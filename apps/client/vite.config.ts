import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // 🟢 FIX: Force Vite to read the Source Code, not the missing 'dist' folder
      '@connexify/core-sdk': path.resolve(__dirname, '../../packages/core-sdk/src/index.ts'),
      '@connexify/webrtc-core': path.resolve(__dirname, '../../packages/webrtc-core/src/index.ts'),
      '@connexify/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@connexify/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
  // 🟢 Optimize: Ensure these are pre-bundled so they work in Dev mode
  optimizeDeps: {
    include: [
      '@connexify/core-sdk', 
      '@connexify/webrtc-core', 
      '@connexify/types',
      '@connexify/utils'
    ],
  },
  // ⚠️ Critical for Vercel Monorepo deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
