import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// single place to keep the ids we externalize
const EXTERNALS = [
  "react",
  "react-dom",
  "react-dom/client",      // we alias this to react-dom (UMD exposes createRoot)
  "react/jsx-runtime",     // avoid bundling this by sticking to classic runtime
];

export default defineConfig({
  plugins: [
    react({
      // IMPORTANT: do not use the automatic jsx runtime; UMD doesn’t expose jsx-runtime
      jsxRuntime: "classic",
    }),
  ],
  root: "spa",

  resolve: {
    // Importing `react-dom/client` in your code will be fulfilled by `react-dom`
    alias: {
      "react-dom/client": "react-dom",
    },
  },

  define: {
    // many libs read this; keep it defined at runtime
    "process.env.NODE_ENV": JSON.stringify("production"),
    // tiny shim so any `process` access doesn't crash
    process: { env: { NODE_ENV: "production" } } as any,
    global: "window",
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
      // ✅ we rely on globals provided by index.html
      external: EXTERNALS,
      output: {
        inlineDynamicImports: true,
        // map external ids to the real window globals
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM", // alias → same global
          "react/jsx-runtime": "React",   // avoided by classic runtime, but safe
        },
        assetFileNames(assetInfo) {
          const n = assetInfo?.name || "";
          if (n.endsWith(".css") || n === "style.css") return "hesaa-homepage.css";
          return n;
        },
      },
    },
  },
});
