import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import solutionHandler from "./api/solution";
import type { IncomingMessage, ServerResponse } from "http";

const localApiPlugin = (): Plugin => ({
  name: "local-api",
  configureServer(server: ViteDevServer) {
    server.middlewares.use("/api/solution", async (
      req: IncomingMessage,
      res: ServerResponse,
    ) => {
      const chunks: Buffer[] = [];

      req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      req.on("end", async () => {
        const rawBody = Buffer.concat(chunks).toString("utf8");
        let body = {};

        try {
          body = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid JSON body" }));
          return;
        }

        const request = {
          method: req.method,
          body,
        };

        const response = {
          status(code: number) {
            res.statusCode = code;
            return response;
          },
          json(data: unknown) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          },
        };

        await solutionHandler(request, response);
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
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
          rewrite: (path) =>
            path.replace(/^\/api\/nvidia/, "/v1/chat/completions"),
        },
      },
    },
    plugins: [
      react(),
      localApiPlugin(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
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
        reporter: ["text", "html"],
      },
    },
  };
});
