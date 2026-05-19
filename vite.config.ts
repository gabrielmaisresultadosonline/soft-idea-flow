// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Attempting to fix the missing server.js error by explicitly setting the entry
    server: { entry: "src/server.ts" },
  },
  vite: {
    server: {
      host: true,
      port: 3000,
      allowedHosts: true
    },
    preview: {
      host: true,
      port: 3000,
      allowedHosts: true
    }
  }
});