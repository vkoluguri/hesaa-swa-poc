import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "spa",

  // Replace process.env.* at build time (prevents “process is not defined”)
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {}, // keep harmless
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client"],
  },

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
      // We’re loading UMD builds in index.html, so mark these as externals
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        inlineDynamicImports: true,
        // Map externals → UMD globals
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          // UMD doesn’t export a separate client object — createRoot is on ReactDOM
          "react-dom/client": "ReactDOM",
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
          return name;
        },
      },
    },
  },
});
