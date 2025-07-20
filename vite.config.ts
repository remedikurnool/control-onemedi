
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Completely exclude API directory from build
      external: (id) => {
        return id.includes('/src/api/') || 
               id.includes('src/api/') || 
               id.includes('./src/api/') ||
               id.startsWith('src/api') ||
               id.includes('api-server/') ||
               id.includes('/api/') ||
               id.startsWith('api/');
      }
    }
  },
  // Exclude API directory from all processing
  optimizeDeps: {
    exclude: ['src/api', 'api-server', './src/api', './api-server', 'api']
  },
  // Define environment for frontend-only build
  define: {
    __API_EXCLUDED__: true
  }
});
