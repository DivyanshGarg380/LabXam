import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/nvidia": {
        target: "https://integrate.api.nvidia.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, "/v1/chat/completions"),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/setup.ts",
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
}));