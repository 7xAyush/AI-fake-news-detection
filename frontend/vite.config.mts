import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    // Enable Tailwind v4 processing for the design CSS.
    tailwindcss(),
  ],
  server: {
    port: 4173,
    strictPort: true,
  },
});
