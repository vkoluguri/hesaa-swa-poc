import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isExternal = (id: string) =>
  id === "react" ||
  id === "react-dom" ||
  id === "react-dom/client" ||
  id.startsWith("react/jsx-runtime");

export default defineConfig({
  root: "spa",
  plugins: [react({ jsxRuntime: "classic" })],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {} as any,
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
      external: isExternal,
      output: {
        inlineDynamicImports: true,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM",   // UMD exposes createRoot on ReactDOM
          "react/jsx-runtime": "React",      // guarded by jsxRuntime: 'classic'
        },
        assetFileNames: (info) => {
          const n = info.name || "";
          if (n.endsWith(".css") || n === "style.css") return "hesaa-homepage.css";
          return n;
        },
      },
    },
  },
});
