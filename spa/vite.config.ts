import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function assetFileNames(assetInfo: any) {
  const name = assetInfo?.name || "";
  if (name.endsWith(".css") || name === "style.css") return "hesaa-homepage.css";
  return name;
}

export default defineConfig({
  root: "spa",
  plugins: [react({ jsxRuntime: "classic" })],
  define: {
    "process.env": {}, // avoid 'process is not defined'
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",

    // ✅ lib build resolves entry relative to "root"
    lib: {
      entry: "src/main.tsx",
      name: "HESAAHome",
      fileName: () => "hesaa-homepage.iife.js",
      formats: ["iife"],
    },

    rollupOptions: {
      // ✅ externalize react UMDs; our index.html provides globals
      external: ["react", "react-dom", "react-dom/client"],
      output: {
        inlineDynamicImports: true,
        assetFileNames,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOMClient",
        },
      },
    },
  },
});
