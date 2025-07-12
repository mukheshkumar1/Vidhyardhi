import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/", // Important for Vercel
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          framer: ["framer-motion"],
          ui: [
            "@/components/ui/button",
            "@/components/ui/dialog",
            "@/components/ui/scroll-area",
            "@/components/ui/sheet",
            "@/components/ui/separator",
            "@/components/ui/avatar",
            "@/components/ui/badge",
            "@/components/ui/card",
            "@/components/ui/checkbox",
            "@/components/ui/carousel",
            "@/components/ui/chart",
            "@/components/ui/drawer",
            "@/components/ui/input",
            "@/components/ui/label",
            "@/components/ui/progress",
            "@/components/ui/radio-group",
            "@/components/ui/select",
            "@/components/ui/sidebar",
            "@/components/ui/switch",
            "@/components/ui/skeleton",
            "@/components/ui/tabs",
            "@/components/ui/toast",
            "@/components/ui/tooltip"
          ]
        }
      }
    }
  }
});
