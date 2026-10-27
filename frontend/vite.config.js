import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ["react-markdown", "remark-gfm"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3001,
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:8000",
        changeOrigin: true,
        timeout: 60000,
        configure: (proxy, _options) => {
          proxy.on("error", (err, req, res) => {
            // Avoid unhandled socket crashes when backend is starting up, restarting, or closed
            if (res && !res.headersSent && typeof res.writeHead === "function") {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  status: "error",
                  detail:
                    "Backend service unavailable at " +
                    (process.env.API_PROXY_TARGET || "http://127.0.0.1:8000") +
                    ". Please verify that the backend is running.",
                })
              );
            }
          });
        },
      },
    },
  },
});

