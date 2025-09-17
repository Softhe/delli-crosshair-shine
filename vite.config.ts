import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command, mode }) => {
  const isDev = mode === "development";
  const isServe = command === "serve";

  return {
    base: isServe ? "/" : "/delli-crosshair-shine/",
    plugins: [
      react(),
      // Only enable the tagger in development (optional)
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
