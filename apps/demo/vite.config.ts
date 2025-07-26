// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // this makes the dev server listen on your local IP
    port: 5173, // or any port you prefer,
    allowedHosts: ["https://shubham.loca.lt", "shubham.loca.lt"],
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,             // ⚠️ Enable WebSocket proxying
        changeOrigin: true,
      }
    }
  }
});
