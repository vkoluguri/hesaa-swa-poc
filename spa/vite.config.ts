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
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "es2019",
    outDir: "../assets/app",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsDir: ".",
    rollupOptions: {
      input: "src/main.tsx",                 // relative to root "spa"
      external: [
        "react",
        "react-dom",
        "react-dom/client",
      ],
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "hesaa-homepage.iife.js",
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
