import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    port: 3000, // Force port 3000
    strictPort: true,
    allowedHosts: [".ngrok-free.dev", ".ngrok.app"],
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
  },
});
