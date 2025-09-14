import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "spa",
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",
    lib: {
      entry: "src/main.tsx",
      name: "HESAAHome",
      fileName: () => "hesaa-homepage.iife.js",
      formats: ["iife"],
    },
    rollupOptions: {
      // Externalize ONLY react & react-dom/client. (We map client -> ReactDOM global.)
      external: ["react", "react-dom/client"],
      output: {
        inlineDynamicImports: true,
        globals: {
          react: "React",
          "react-dom/client": "ReactDOM",
        },
        // keep file names stable if you customize them:
        assetFileNames: (assetInfo) => {
          const name = assetInfo?.name || "";
          if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
          return name;
        },
      },
    },
  },
});
