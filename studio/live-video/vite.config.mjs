import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  define: {
    "process.env": JSON.stringify({ NODE_ENV: "production", I18NEXT_NO_SUPPORT_NOTICE: "true" })
  },
  resolve: {
    alias: [{
      find: "@stream-io/audio-filters-web",
      replacement: fileURLToPath(new URL("./src/noise-cancellation-disabled.js", import.meta.url))
    }]
  },
  build: {
    outDir: fileURLToPath(new URL("../../assets", import.meta.url)),
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
    lib: {
      entry: fileURLToPath(new URL("./src/index.jsx", import.meta.url)),
      formats: ["es"],
      fileName: () => "nbl-studios-live-sdk.js",
      cssFileName: "nbl-studios-live-sdk"
    },
    rollupOptions: {
      output: {
        chunkFileNames: "nbl-studios-live-chunk-[name].js"
      }
    }
  }
});
