// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      host: true,
      port: 3000,
      allowedHosts: ["unidoctelemedicina.com.br", "www.unidoctelemedicina.com.br", "2.24.107.250"]
    },
    preview: {
      host: true,
      port: 3000,
      allowedHosts: ["unidoctelemedicina.com.br", "www.unidoctelemedicina.com.br", "2.24.107.250"]
    }
  }
});