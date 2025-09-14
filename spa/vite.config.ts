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
      // externalize React so the IIFE expects the globals provided by the UMDs we load in index.html
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        inlineDynamicImports: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          // IMPORTANT: react-dom/client -> ReactDOM (UMD has createRoot on ReactDOM)
          "react-dom/client": "ReactDOM",
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo?.name || "";
          if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
          return name;
        },
      },
    },
  },
});
