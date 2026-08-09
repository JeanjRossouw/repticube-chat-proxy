import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The app is opened on http://localhost:3000; API calls are proxied to the
// Express server so the browser only ever talks to one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.CLIENT_PORT) || 3000,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 4000}`,
        changeOrigin: true,
      },
    },
  },
});
