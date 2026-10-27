import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {rollupOptions:{output:{manualChunks:{markdown:["react-markdown","remark-gfm"],react:["react","react-dom"]}}}},
  server: {
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
