import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Helper: treat a module id as external if it matches exactly or startsWith
const isExternal = (id: string) =>
  id === "react" ||
  id === "react-dom" ||
  id === "react-dom/client" ||
  id.startsWith("react/jsx-runtime"); // avoid pulling a second JSX runtime

export default defineConfig({
  root: "spa",

  // Make the plugin use the classic JSX transform (no jsx-runtime import)
  plugins: [react({ jsxRuntime: "classic" })],

  // Replace env at build time; keeps old code from touching window.process
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {} as any,
  },

  // Pre-bundle during dev/build so resolution is stable
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
      // *** THE IMPORTANT PART ***
      external: isExternal,
      output: {
        inlineDynamicImports: true,
        // Map externals → your UMD globals from index.html
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM", // UMD exposes createRoot on ReactDOM
          "react/jsx-runtime": "React",   // guarded by jsxRuntime: 'classic'
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
