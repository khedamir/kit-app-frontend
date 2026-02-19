import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes("node_modules")) {
            // React core
            if (id.includes("react") && !id.includes("react-dom")) {
              return "react-core";
            }
            if (id.includes("react-dom")) {
              return "react-dom";
            }
            // Router
            if (id.includes("react-router")) {
              return "router";
            }
            // React Query
            if (id.includes("@tanstack/react-query")) {
              return "query";
            }
            // State management
            if (id.includes("zustand")) {
              return "zustand";
            }
            // HTTP client
            if (id.includes("axios")) {
              return "axios";
            }
            // Icons
            if (id.includes("lucide-react")) {
              return "icons";
            }
            // Emoji libraries
            if (id.includes("emoji-mart") || id.includes("@emoji-mart")) {
              return "emoji";
            }
            // UI utilities
            if (id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "ui-utils";
            }
            // Other vendor code
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
});
