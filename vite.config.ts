/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const DC_API_ORIGIN = "https://api.datacommons.org";

/**
 * Turns a browser request for /dc/v2/... into a Data Commons request with the
 * API key added. This runs on the dev server, so the key never reaches the
 * client. Data Commons reads the key from the `key` query parameter on GET.
 */
function withApiKey(path: string, apiKey: string): string {
  const url = new URL(path.replace(/^\/dc/, ""), DC_API_ORIGIN);
  url.searchParams.set("key", apiKey);
  return url.pathname + url.search;
}

export default defineConfig(({ command, mode }) => {
  // Load only DC_* variables from .env.
  const { DC_API_KEY = "" } = loadEnv(mode, ".", "DC_");

  if (command === "serve" && !DC_API_KEY) {
    console.warn(
      "\n[dc-mini-explorer] DC_API_KEY is not set. Copy .env.example to .env " +
        "and add your key, or Data Commons requests will fail.\n",
    );
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/dc": {
          target: DC_API_ORIGIN,
          changeOrigin: true,
          rewrite: (path) => withApiKey(path, DC_API_KEY),
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/setupTests.ts",
    },
  };
});
