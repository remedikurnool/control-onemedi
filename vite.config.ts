
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
      external: [
        /^\/src\/api\/.*/,
        /^src\/api\/.*/,
        /^api\/.*/,
        /^\.\/src\/api\/.*/,
        /api-server\/.*/
      ]
    }
  },
  // Exclude API directory from all processing
  optimizeDeps: {
    exclude: ['src/api', 'api-server']
  },
  // Define environment for frontend-only build
  define: {
    // Ensure we're building for frontend only
    __API_EXCLUDED__: true
  }
});
